import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Transaction, UserProfile, Product } from '../types';
import { formatCurrency } from '../utils';
import { Check, X, Users, CreditCard, Package, Trash2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const Admin: React.FC = () => {
  const { profile } = useAuth();
  const [tab, setTab] = useState<'recharge' | 'withdraw' | 'users' | 'products'>('recharge');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'recharge' || tab === 'withdraw') {
        const q = query(
          collection(db, 'transactions'),
          where('type', '==', tab),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (tab === 'users') {
        const snapshot = await getDocs(collection(db, 'users'));
        setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (tab === 'products') {
        const snapshot = await getDocs(collection(db, 'products'));
        setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.isAdmin) {
      fetchData();
    }
  }, [tab, profile]);

  const handleApproveRecharge = async (txId: string) => {
    try {
      const res = await fetch('/api/admin/approve-recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txId, adminUid: profile?.uid })
      });
      if (res.ok) {
        toast.success('Approved');
        fetchData();
      } else {
        toast.error('Failed to approve');
      }
    } catch (err) {
      toast.error('Error');
    }
  };

  const handleApproveWithdraw = async (txId: string) => {
    try {
      const res = await fetch('/api/admin/approve-withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txId, adminUid: profile?.uid })
      });
      if (res.ok) {
        toast.success('Approved');
        fetchData();
      } else {
        toast.error('Failed to approve');
      }
    } catch (err) {
      toast.error('Error');
    }
  };

  const handleReject = async (txId: string) => {
    try {
      await updateDoc(doc(db, 'transactions', txId), { status: 'rejected' });
      toast.success('Rejected');
      fetchData();
    } catch (err) {
      toast.error('Error');
    }
  };

  if (!profile?.isAdmin) return <div className="p-12 text-center">Unauthorized Access</div>;

  return (
    <div className="pb-24 pt-6 px-4 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="text-red-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'recharge', label: 'Recharges', icon: <CreditCard size={16} /> },
          { id: 'withdraw', label: 'Withdraws', icon: <Package size={16} /> },
          { id: 'users', label: 'Users', icon: <Users size={16} /> },
          { id: 'products', label: 'Products', icon: <Package size={16} /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              tab === t.id ? 'bg-emerald-600 text-white' : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {tab === 'recharge' && data.map((tx: Transaction) => (
            <div key={tx.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">{formatCurrency(tx.amount)}</p>
                <p className="text-xs text-gray-400">User ID: {tx.userId}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleApproveRecharge(tx.id)} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Check size={20} /></button>
                <button onClick={() => handleReject(tx.id)} className="p-2 bg-red-100 text-red-600 rounded-lg"><X size={20} /></button>
              </div>
            </div>
          ))}

          {tab === 'withdraw' && data.map((tx: Transaction) => (
            <div key={tx.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">{formatCurrency(tx.amount)}</p>
                  <p className="text-xs text-gray-400">User ID: {tx.userId}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApproveWithdraw(tx.id)} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Check size={20} /></button>
                  <button onClick={() => handleReject(tx.id)} className="p-2 bg-red-100 text-red-600 rounded-lg"><X size={20} /></button>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-600 font-mono">
                {tx.accountDetails}
              </div>
            </div>
          ))}

          {tab === 'users' && data.map((user: UserProfile) => (
            <div key={user.uid} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-400">{user.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-600">Bal: {formatCurrency(user.mainBalance)}</p>
                <p className="text-[10px] text-gray-400">Ref: {user.referralCode}</p>
              </div>
            </div>
          ))}

          {tab === 'products' && data.map((prod: Product) => (
            <div key={prod.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={prod.image} className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <p className="font-bold text-gray-800">{prod.name}</p>
                  <p className="text-xs text-emerald-600">{formatCurrency(prod.price)}</p>
                </div>
              </div>
              <button className="p-2 text-red-400 hover:text-red-600"><Trash2 size={20} /></button>
            </div>
          ))}
          
          {data.length === 0 && <div className="text-center py-12 text-gray-500">No data found</div>}
        </div>
      )}
    </div>
  );
};

export default Admin;
