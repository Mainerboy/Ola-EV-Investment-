import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Share2, Copy, Users, TrendingUp, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

const Promotion: React.FC = () => {
  const { profile } = useAuth();
  const referralLink = `${window.location.origin}/login?ref=${profile?.referralCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="pb-24 pt-6 px-4 space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <Gift className="text-emerald-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-800">Refer & Earn</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center space-y-6"
      >
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
          <Share2 size={32} />
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-gray-800">Invite Your Friends</h2>
          <p className="text-sm text-gray-500 mt-2">
            Earn 5% commission on every profit your referred friends make from their investments.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
            <p className="text-[10px] text-gray-400 uppercase font-bold mb-2">Your Referral Code</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-emerald-600 tracking-widest">{profile?.referralCode}</span>
              <button 
                onClick={() => copyToClipboard(profile?.referralCode || '')}
                className="p-2 bg-white rounded-xl shadow-sm text-gray-400 hover:text-emerald-600 transition-colors"
              >
                <Copy size={20} />
              </button>
            </div>
          </div>

          <button 
            onClick={() => copyToClipboard(referralLink)}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Share2 size={20} />
            Share Referral Link
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
          <Users className="mx-auto mb-2 text-blue-500" size={24} />
          <p className="text-[10px] text-gray-400 uppercase font-bold">Total Referrals</p>
          <p className="text-xl font-bold text-gray-800">0</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
          <TrendingUp className="mx-auto mb-2 text-emerald-500" size={24} />
          <p className="text-[10px] text-gray-400 uppercase font-bold">Total Earnings</p>
          <p className="text-xl font-bold text-gray-800">₹0</p>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
        <h3 className="font-bold text-blue-800 mb-2">How it works?</h3>
        <ul className="text-xs text-blue-700 space-y-2 list-disc pl-4">
          <li>Share your referral code or link with friends.</li>
          <li>When they register and invest, you become their sponsor.</li>
          <li>Every time they receive daily profit, you get 5% of that amount instantly.</li>
          <li>Earnings are credited directly to your Main Balance.</li>
        </ul>
      </div>
    </div>
  );
};

export default Promotion;
