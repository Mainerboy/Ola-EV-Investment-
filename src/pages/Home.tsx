import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils';
import { motion } from 'motion/react';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, Zap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Home: React.FC = () => {
  const { profile } = useAuth();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const syncProfits = async () => {
      try {
        setSyncing(true);
        const res = await fetch('/api/sync-profits', { method: 'POST' });
        if (!res.ok) throw new Error('Sync failed');
      } catch (err) {
        console.error(err);
      } finally {
        setSyncing(false);
      }
    };

    if (profile) {
      syncProfits();
    }
  }, [profile?.uid]);

  if (!profile) return null;

  return (
    <div className="pb-24 pt-6 px-4 space-y-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Hello, {profile.name}</h1>
          <p className="text-sm text-gray-500">{profile.phone}</p>
        </div>
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
          <Zap size={20} />
        </div>
      </div>

      {/* Balance Card */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-100 relative overflow-hidden"
      >
        <div className="relative z-10">
          <p className="text-emerald-100 text-sm mb-1">Main Balance</p>
          <h2 className="text-4xl font-bold mb-6">{formatCurrency(profile.mainBalance)}</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3">
              <p className="text-emerald-100 text-[10px] uppercase tracking-wider mb-1">Recharge Wallet</p>
              <p className="font-bold">{formatCurrency(profile.rechargeWallet)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3">
              <p className="text-emerald-100 text-[10px] uppercase tracking-wider mb-1">Total Withdraw</p>
              <p className="font-bold">{formatCurrency(profile.totalWithdraw)}</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl"></div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link 
          to="/recharge"
          className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <ArrowUpRight size={20} />
          </div>
          <span className="font-semibold text-gray-700">Recharge</span>
        </Link>
        <Link 
          to="/withdraw"
          className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
            <ArrowDownLeft size={20} />
          </div>
          <span className="font-semibold text-gray-700">Withdraw</span>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Investment Overview</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                <TrendingUp size={16} />
              </div>
              <span className="text-sm font-medium text-gray-600">Daily Earnings</span>
            </div>
            <span className="font-bold text-emerald-600">+ {formatCurrency(0)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                <History size={16} />
              </div>
              <span className="text-sm font-medium text-gray-600">Active Orders</span>
            </div>
            <Link to="/orders" className="text-sm font-bold text-gray-800 underline">View All</Link>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 text-white overflow-hidden relative">
        <div className="relative z-10">
          <h4 className="font-bold text-lg mb-1">Refer & Earn 5%</h4>
          <p className="text-emerald-100 text-xs mb-4">Get commission on every profit your friends make.</p>
          <Link to="/promotion" className="bg-white text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold inline-block">Invite Now</Link>
        </div>
        <Zap className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10" size={80} />
      </div>
    </div>
  );
};

export default Home;
