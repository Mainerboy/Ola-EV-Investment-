import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { LogOut, User, Phone, Shield, ChevronRight, History, CreditCard, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { profile } = useAuth();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (!profile) return null;

  const menuItems = [
    { icon: <History size={20} />, label: 'Transaction History', path: '/transactions', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: <CreditCard size={20} />, label: 'My Orders', path: '/orders', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: <Wallet size={20} />, label: 'Withdrawal Info', path: '/withdraw', color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: <Shield size={20} />, label: 'Security Center', path: '#', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="pb-24 pt-6 px-4 space-y-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 px-2">Account</h1>

      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <Phone size={12} />
            <span>+91 {profile.phone}</span>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
        {menuItems.map((item, index) => (
          <Link 
            key={index}
            to={item.path}
            className={`flex items-center justify-between p-5 hover:bg-gray-50 transition-colors ${
              index !== menuItems.length - 1 ? 'border-b border-gray-50' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center`}>
                {item.icon}
              </div>
              <span className="font-semibold text-gray-700">{item.label}</span>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </Link>
        ))}
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
      >
        <LogOut size={20} />
        Logout Account
      </button>

      <div className="text-center">
        <p className="text-[10px] text-gray-300 uppercase tracking-widest font-bold">App Version 1.0.0</p>
      </div>
    </div>
  );
};

export default Profile;
