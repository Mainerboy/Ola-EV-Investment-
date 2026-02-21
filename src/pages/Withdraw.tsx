import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { ArrowLeft, Landmark, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils';

const Withdraw: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    
    if (!profile) return;
    if (numAmount < 200) return toast.error('Minimum withdrawal is ₹200');
    if (numAmount > profile.mainBalance) return toast.error('Insufficient balance');
    if (!bankDetails) return toast.error('Enter bank/UPI details');
    
    setLoading(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      
      await addDoc(collection(db, 'transactions'), {
        userId: profile.uid,
        type: 'withdraw',
        amount: numAmount,
        status: 'pending',
        createdAt: serverTimestamp(),
        accountDetails: bankDetails,
      });

      await updateDoc(userRef, {
        mainBalance: increment(-numAmount)
      });

      toast.success('Withdrawal request submitted successfully.');
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
        <h1 className="text-xl font-bold text-gray-800">Withdraw Funds</h1>
      </div>

      <div className="p-6 max-w-lg mx-auto space-y-6">
        <div className="bg-orange-500 rounded-3xl p-6 text-white shadow-lg">
          <p className="text-orange-100 text-sm mb-1">Available to Withdraw</p>
          <h2 className="text-3xl font-bold">{formatCurrency(profile?.mainBalance || 0)}</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Withdraw Amount (Min ₹200)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-xl font-bold"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bank / UPI Details</label>
            <textarea
              value={bankDetails}
              onChange={(e) => setBankDetails(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
              placeholder="Enter Bank Name, A/C Number, IFSC or UPI ID"
              rows={3}
              required
            />
          </div>

          <div className="bg-orange-50 p-4 rounded-2xl flex gap-3">
            <AlertCircle className="text-orange-600 shrink-0" size={20} />
            <p className="text-xs text-orange-700 leading-relaxed">
              Withdrawals are processed within 24 hours. Please ensure your bank details are correct.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-100 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Withdraw Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Withdraw;
