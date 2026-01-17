
import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Truck, 
  Users, 
  TrendingUp, 
  CreditCard, 
  Settings,
  CircleDollarSign,
  Wallet
} from 'lucide-react';

export const TRANSLATIONS = {
  EN: {
    dashboard: 'Dashboard',
    orders: 'Orders',
    inventory: 'Inventory',
    logistics: 'Logistics',
    customers: 'Customers',
    financials: 'Financials',
    staff: 'User Management',
    loans: 'Loans',
    settings: 'Settings',
    todayStats: "Today's Stats",
    income: 'Income',
    expense: 'Expense',
    profit: 'Profit',
    activeLoans: 'Active Loans',
    pendingCOD: 'Pending COD',
    currency: '৳',
    lowStock: 'Low Stock Alerts',
    createOrder: 'Create Order',
    logout: 'Logout',
    english: 'English',
    bengali: 'বাংলা',
    login: 'Login to Purnata',
    emailPlaceholder: 'Enter your work email',
    loginButton: 'Continue to Dashboard',
    noUserFound: 'No user found with this email.',
    welcomeBack: 'Welcome Back'
  },
  BN: {
    dashboard: 'ড্যাশবোর্ড',
    orders: 'অর্ডার',
    inventory: 'ইনভেন্টরি',
    logistics: 'লজিস্টিকস',
    customers: 'কাস্টমার',
    financials: 'অর্থনীতি',
    staff: 'ব্যবহারকারী ব্যবস্থাপনা',
    loans: 'ঋণ',
    settings: 'সেটিংস',
    todayStats: 'আজকের তথ্য',
    income: 'আয়',
    expense: 'ব্যয়',
    profit: 'লাভ',
    activeLoans: 'সক্রিয় ঋণ',
    pendingCOD: 'বাকি সিওডি',
    currency: '৳',
    lowStock: 'স্টক অ্যালার্ট',
    createOrder: 'অর্ডার তৈরি করুন',
    logout: 'লগআউট',
    english: 'English',
    bengali: 'বাংলা',
    login: 'পূর্ণতায় লগইন করুন',
    emailPlaceholder: 'আপনার কাজের ইমেইল দিন',
    loginButton: 'ড্যাশবোর্ডে যান',
    noUserFound: 'এই ইমেইল দিয়ে কোনো ব্যবহারকারী পাওয়া যায়নি।',
    welcomeBack: 'আপনাকে স্বাগতম'
  }
};

export const MENU_ITEMS = [
  { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'dashboard' },
  { id: 'orders', icon: <ShoppingCart size={18} />, label: 'orders' },
  { id: 'inventory', icon: <Package size={18} />, label: 'inventory' },
  { id: 'logistics', icon: <Truck size={18} />, label: 'logistics' },
  { id: 'customers', icon: <Users size={18} />, label: 'customers' },
  { id: 'financials', icon: <CircleDollarSign size={18} />, label: 'financials' },
  { id: 'loans', icon: <Wallet size={18} />, label: 'loans' },
  { id: 'staff', icon: <TrendingUp size={18} />, label: 'staff' },
  { id: 'settings', icon: <Settings size={18} />, label: 'settings' },
];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: ['dashboard', 'orders', 'inventory', 'logistics', 'customers', 'financials', 'loans', 'staff', 'settings'],
  MANAGER: ['orders', 'inventory', 'logistics'],
  ACCOUNTS: ['financials', 'loans'],
  STAFF: ['orders', 'customers'],
  VIEWER: ['dashboard', 'inventory']
};

export const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  PACKED: 'bg-purple-100 text-purple-800 border-purple-200',
  SHIPPED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  RETURNED: 'bg-orange-100 text-orange-800 border-orange-200',
};
