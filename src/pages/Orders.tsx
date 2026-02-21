import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Investment } from '../types';
import { formatCurrency } from '../utils';
import { ArrowLeft, Zap, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const Orders: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchInvestments = async () => {
      if (!profile) return;
      const q = query(
        collection(db, 'investments'),
        where('userId', '==', profile.uid),
        orderBy('startDate', 'desc')
      );
      const snapshot = await getDocs(q);
      setInvestments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Investment)));
      setLoading(false);
    };
    fetchInvestments();
  }, [profile]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-4 flex items-center gap-4 border-b border-gray-100">
        <Link to="/"><ArrowLeft size={24} className="text-gray-600" /></Link>
        <h1 className="text-xl font-bold text-gray-800">My Investments</h1>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : investments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No active investments</div>
        ) : (
          investments.map((inv) => (
            <div key={inv.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{inv.productName}</h3>
                    <p className="text-xs text-gray-400">ID: {inv.id.substring(0, 8)}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                  inv.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {inv.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <p className="text-[10px] text-gray-400 uppercase mb-1">Invested Amount</p>
                  <p className="font-bold text-gray-800">{formatCurrency(inv.amount)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <p className="text-[10px] text-gray-400 uppercase mb-1">Total Earned</p>
                  <p className="font-bold text-emerald-600">{formatCurrency(inv.totalEarned)}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1"><Calendar size={12} /> Start Date</span>
                  <span className="font-medium text-gray-600">
                    {inv.startDate?.toDate ? format(inv.startDate.toDate(), 'dd MMM yyyy') : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1"><Calendar size={12} /> End Date</span>
                  <span className="font-medium text-gray-600">
                    {inv.endDate?.toDate ? format(inv.endDate.toDate(), 'dd MMM yyyy') : format(inv.endDate, 'dd MMM yyyy')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1"><TrendingUp size={12} /> Daily Profit</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(inv.dailyProfit)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
