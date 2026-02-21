import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Zap, Users, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BottomNav: React.FC = () => {
  const { profile } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center z-50">
      <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
        <Home size={24} />
        <span className="text-[10px] font-medium">Home</span>
      </NavLink>
      <NavLink to="/products" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
        <Zap size={24} />
        <span className="text-[10px] font-medium">Products</span>
      </NavLink>
      <NavLink to="/promotion" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
        <Users size={24} />
        <span className="text-[10px] font-medium">Promotion</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
        <User size={24} />
        <span className="text-[10px] font-medium">Profile</span>
      </NavLink>
      {profile?.isAdmin && (
        <NavLink to="/admin" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
          <ShieldCheck size={24} />
          <span className="text-[10px] font-medium">Admin</span>
        </NavLink>
      )}
    </nav>
  );
};

export default BottomNav;
