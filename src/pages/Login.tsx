import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { generateReferralCode } from '../utils';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';

const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [referral, setReferral] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'register'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) return toast.error('Enter valid 10-digit phone number');
    
    setLoading(true);
    try {
      setupRecaptcha();
      const phoneNumber = `+91${phone}`;
      const result = await signInWithPhoneNumber(auth, phoneNumber, (window as any).recaptchaVerifier);
      setConfirmationResult(result);
      setStep('otp');
      toast.success('OTP sent successfully');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        toast.success('Welcome back!');
      } else {
        setStep('register');
      }
    } catch (error: any) {
      toast.error('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return toast.error('Name is required');
    
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user found');

      // Check if phone already exists (redundant but safe)
      const q = query(collection(db, 'users'), where('phone', '==', phone));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        toast.error('Phone number already registered');
        return;
      }

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        phone: phone,
        name: name,
        rechargeWallet: 0,
        mainBalance: 0,
        totalWithdraw: 0,
        referralCode: generateReferralCode(),
        referredBy: referral || null,
        status: 'active',
        isAdmin: false,
        createdAt: serverTimestamp(),
      });

      toast.success('Registration successful!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
            <Zap className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 font-poppins">EV Charge Invest</h1>
          <p className="text-gray-500 text-sm">Powering your future investments</p>
        </div>

        <div id="recaptcha-container"></div>

        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                  placeholder="Enter 10 digit number"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-emerald-100 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none text-center text-2xl tracking-widest"
                placeholder="000000"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-emerald-100 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button 
              type="button" 
              onClick={() => setStep('phone')}
              className="w-full text-emerald-600 text-sm font-medium"
            >
              Change Phone Number
            </button>
          </form>
        )}

        {step === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referral Code (Optional)</label>
              <input
                type="text"
                value={referral}
                onChange={(e) => setReferral(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                placeholder="Enter code"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-emerald-100 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
