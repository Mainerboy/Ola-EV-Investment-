import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Transaction } from '../types';
import { formatCurrency } from '../utils';
import { ArrowLeft, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!profile) return;
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', profile.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
      setLoading(false);
    };
    fetchTransactions();
  }, [profile]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-4 flex items-center gap-4 border-b border-gray-100">
        <Link to="/profile"><ArrowLeft size={24} className="text-gray-600" /></Link>
        <h1 className="text-xl font-bold text-gray-800">Transaction History</h1>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No transactions found</div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  tx.type === 'recharge' ? 'bg-blue-50 text-blue-600' :
                  tx.type === 'withdraw' ? 'bg-orange-50 text-orange-600' :
                  tx.type === 'investment' ? 'bg-purple-50 text-purple-600' :
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  {tx.type === 'recharge' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                </div>
                <div>
                  <p className="font-bold text-gray-800 capitalize">{tx.type}</p>
                  <p className="text-[10px] text-gray-400">
                    {tx.createdAt?.toDate ? format(tx.createdAt.toDate(), 'dd MMM yyyy, hh:mm a') : 'Pending...'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${
                  tx.type === 'withdraw' || tx.type === 'investment' ? 'text-red-500' : 'text-emerald-600'
                }`}>
                  {tx.type === 'withdraw' || tx.type === 'investment' ? '-' : '+'} {formatCurrency(tx.amount)}
                </p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  tx.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                  tx.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {tx.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Transactions;
