export interface UserProfile {
  uid: string;
  phone: string;
  name: string;
  rechargeWallet: number;
  mainBalance: number;
  totalWithdraw: number;
  referralCode: string;
  referredBy?: string;
  status: 'active' | 'blocked';
  isAdmin: boolean;
  createdAt: any;
  lastLoginIp?: string;
  deviceId?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  duration: number; // in days
  dailyProfit: number;
  totalReturn: number;
  image: string;
  category?: string;
}

export interface Investment {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  amount: number;
  dailyProfit: number;
  startDate: any;
  endDate: any;
  status: 'active' | 'completed';
  lastProfitClaim: any;
  totalEarned: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'recharge' | 'withdraw' | 'investment' | 'profit' | 'referral';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  paymentMethod?: string;
  accountDetails?: string;
}
