import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils';
import { motion } from 'motion/react';
import { Zap, Clock, TrendingUp, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const prods = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      
      // If no products, add some defaults for demo
      if (prods.length === 0) {
        const defaults: Omit<Product, 'id'>[] = [
          { name: 'EV Lite', price: 700, duration: 2, dailyProfit: 35, totalReturn: 770, image: 'https://picsum.photos/seed/ev1/400/300' },
          { name: 'EV Pro', price: 2000, duration: 10, dailyProfit: 120, totalReturn: 3200, image: 'https://picsum.photos/seed/ev2/400/300' },
          { name: 'EV Ultra', price: 5000, duration: 30, dailyProfit: 350, totalReturn: 15500, image: 'https://picsum.photos/seed/ev3/400/300' },
        ];
        for (const p of defaults) {
          await addDoc(collection(db, 'products'), p);
        }
        fetchProducts();
        return;
      }
      setProducts(prods);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleBuy = async (product: Product) => {
    if (!profile) return;
    if (profile.rechargeWallet < product.price) {
      return toast.error('Insufficient balance in Recharge Wallet');
    }

    const confirm = window.confirm(`Buy ${product.name} for ${formatCurrency(product.price)}?`);
    if (!confirm) return;

    try {
      const userRef = doc(db, 'users', profile.uid);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + product.duration);

      await addDoc(collection(db, 'investments'), {
        userId: profile.uid,
        productId: product.id,
        productName: product.name,
        amount: product.price,
        dailyProfit: product.dailyProfit,
        startDate: serverTimestamp(),
        endDate: endDate,
        status: 'active',
        lastProfitClaim: serverTimestamp(),
        totalEarned: 0
      });

      await updateDoc(userRef, {
        rechargeWallet: increment(-product.price)
      });

      await addDoc(collection(db, 'transactions'), {
        userId: profile.uid,
        type: 'investment',
        amount: product.price,
        status: 'approved',
        createdAt: serverTimestamp(),
        productName: product.name
      });

      toast.success('Investment started successfully!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="pb-24 pt-6 px-4 space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <ShoppingBag className="text-emerald-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-800">Investment Plans</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {products.map((product) => (
            <motion.div 
              key={product.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100"
            >
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-48 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                    <p className="text-emerald-600 font-bold text-lg">{formatCurrency(product.price)}</p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Zap size={12} />
                    EV Station
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="bg-gray-50 p-3 rounded-2xl text-center">
                    <Clock size={16} className="mx-auto mb-1 text-gray-400" />
                    <p className="text-[10px] text-gray-500 uppercase">Duration</p>
                    <p className="font-bold text-sm">{product.duration} Days</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl text-center">
                    <TrendingUp size={16} className="mx-auto mb-1 text-emerald-400" />
                    <p className="text-[10px] text-gray-500 uppercase">Daily</p>
                    <p className="font-bold text-sm">{formatCurrency(product.dailyProfit)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl text-center">
                    <Zap size={16} className="mx-auto mb-1 text-blue-400" />
                    <p className="text-[10px] text-gray-500 uppercase">Total</p>
                    <p className="font-bold text-sm">{formatCurrency(product.totalReturn)}</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleBuy(product)}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                >
                  Invest Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
