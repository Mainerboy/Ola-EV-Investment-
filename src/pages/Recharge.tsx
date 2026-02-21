import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { ArrowLeft, Wallet, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils';

const Recharge: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (numAmount < 100) return toast.error('Minimum recharge is ₹100');
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: profile?.uid,
        type: 'recharge',
        amount: numAmount,
        status: 'pending',
        createdAt: serverTimestamp(),
        paymentMethod: 'UPI',
      });
      toast.success('Recharge request submitted. Waiting for admin approval.');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-4 flex items-center gap-4 border-b border-gray-100">
        <Link to="/"><ArrowLeft size={24} className="text-gray-600" /></Link>
        <h1 className="text-xl font-bold text-gray-800">Recharge Wallet</h1>
      </div>

      <div className="p-6 max-w-lg mx-auto space-y-6">
        <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-lg">
          <p className="text-emerald-100 text-sm mb-1">Current Balance</p>
          <h2 className="text-3xl font-bold">{formatCurrency(profile?.rechargeWallet || 0)}</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enter Amount (Min ₹100)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-xl font-bold"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[500, 1000, 2000, 5000, 10000, 20000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toString())}
                className="py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-all"
              >
                ₹{val}
              </button>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl flex gap-3">
            <CheckCircle2 className="text-blue-600 shrink-0" size={20} />
            <p className="text-xs text-blue-700 leading-relaxed">
              After payment, your request will be reviewed by our admin team. It usually takes 5-30 minutes for approval.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Submit Recharge Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Recharge;
