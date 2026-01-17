
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Language, 
  UserRole, 
  Order, 
  Product, 
  Expense, 
  Income, 
  Loan, 
  Customer, 
  OrderStatus, 
  AppUser,
  CourierConfig,
  CourierType 
} from './types';
import { TRANSLATIONS } from './constants';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import OrdersView from './views/OrdersView';
import InventoryView from './views/InventoryView';
import LogisticsView from './views/LogisticsView';
import CustomersView from './views/CustomersView';
import FinancialsView from './views/FinancialsView';
import LoansView from './views/LoansView';
import StaffView from './views/StaffView';
import SettingsView from './views/SettingsView';
import OrderDetailsView from './views/OrderDetailsView';

import { productService } from './services/productService';
import { orderService } from './services/orderService';
import { financeService } from './services/financeService';
import { userService } from './services/userService';
import { courierService } from './services/courierService';
import { steadfastService } from './services/couriers/steadfast.service';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('EN');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [courierConfigs, setCourierConfigs] = useState<CourierConfig[]>([]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  // Auth: Load session
  useEffect(() => {
    const savedEmail = localStorage.getItem('purnata_user_email');
    if (savedEmail) {
      userService.getUserByEmail(savedEmail).then(user => {
        if (user) {
          setCurrentUser(user);
          if (!user.permissions.includes('dashboard')) {
            setActiveTab(user.permissions[0]);
          }
        }
      });
    }
  }, []);

  const handleLogin = (user: AppUser) => {
    localStorage.setItem('purnata_user_email', user.email);
    setCurrentUser(user);
    if (!user.permissions.includes('dashboard')) {
      setActiveTab(user.permissions[0]);
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('purnata_user_email');
    setCurrentUser(null);
  };

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const loadAll = async () => {
      try {
        setLoading(true);
        const [p, o, inc, exp, l, u, c] = await Promise.all([
          productService.getAll(),
          orderService.getAll(),
          financeService.getIncomes(),
          financeService.getExpenses(),
          financeService.getLoans(),
          userService.getAll(),
          courierService.getAll()
        ]);
        setProducts(p);
        setOrders(o);
        setIncomes(inc);
        setExpenses(exp);
        setLoans(l);
        setUsers(u);
        setCourierConfigs(c);
      } catch (err) {
        showToast("Initial data sync failed", 'error');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [currentUser, showToast]);

  const customers = useMemo(() => {
    const customerMap = new Map<string, Customer>();
    orders.forEach(order => {
      const existing = customerMap.get(order.phone);
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += order.total;
        existing.history.push(order.id);
      } else {
        customerMap.set(order.phone, {
          id: `cust-${order.phone}`,
          name: order.customerName,
          phone: order.phone,
          orderCount: 1,
          totalSpent: order.total,
          isFlagged: false,
          history: [order.id]
        });
      }
    });
    return Array.from(customerMap.values());
  }, [orders]);

  /**
   * Local Inventory Deduction Helper
   */
  const deductInventoryLocally = useCallback((items: Array<{ productId: string; quantity: number }>) => {
    setProducts(prev => prev.map(p => {
      const item = items.find(i => i.productId === p.id);
      if (item) return { ...p, stock: p.stock - item.quantity };
      return p;
    }));
  }, []);

  const handleAddOrder = useCallback(async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    try {
      const newOrder = await orderService.create(orderData);
      setOrders(prev => [newOrder, ...prev]);
      if (newOrder.status === OrderStatus.CONFIRMED) {
        deductInventoryLocally(newOrder.items);
      }
      showToast("Order saved successfully");
      setSelectedOrderId(newOrder.id);
      setActiveTab('orders');
    } catch (err) {
      showToast("Failed to save order", "error");
    }
  }, [showToast, deductInventoryLocally]);

  const handleUpdateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    const orderBefore = orders.find(o => o.id === orderId);
    const updated = await orderService.updateStatus(orderId, newStatus);
    setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    if (orderBefore && orderBefore.status === OrderStatus.PENDING && newStatus === OrderStatus.CONFIRMED) {
      deductInventoryLocally(updated.items);
    }
    showToast(`Order status updated to ${newStatus}`);
  }, [orders, showToast, deductInventoryLocally]);

  /**
   * Steadfast Booking Handler
   */
  const handleBookSteadfast = useCallback(async (orderId: string) => {
    const order = orders.find(o => o.id === orderId) || await orderService.getById(orderId);
    const config = courierConfigs.find(c => c.type === CourierType.STEADFAST);

    if (!order) return;
    if (!config?.isActive || !config.apiKey) {
      showToast("Steadfast API Key required. Check settings.", 'error');
      return;
    }

    try {
      const response = await steadfastService.createShipment(order, config.apiKey, config.storeId || "");
      const updated = await orderService.updateCourierInfo(orderId, {
        courierId: response.courier_id,
        trackingId: response.tracking_id,
        courierType: CourierType.STEADFAST,
        status: OrderStatus.SHIPPED
      });
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      showToast("Steadfast Booking Successful!");
    } catch (err: any) {
      showToast(err.message || "Steadfast connection failed", 'error');
    }
  }, [orders, courierConfigs, showToast]);

  /**
   * Steadfast Tracking Handler
   */
  const handleTrackSteadfast = useCallback(async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    const config = courierConfigs.find(c => c.type === CourierType.STEADFAST);

    if (!order?.trackingId || !config) return;

    try {
      const apiStatus = await steadfastService.trackShipment(order.trackingId, config.apiKey, config.storeId || "");
      
      let nextStatus: OrderStatus = order.status;
      if (apiStatus === 'DELIVERED') nextStatus = OrderStatus.DELIVERED;
      else if (apiStatus === 'RETURNED') nextStatus = OrderStatus.RETURNED;
      else if (apiStatus === 'CANCELLED') nextStatus = OrderStatus.CANCELLED;
      else if (apiStatus === 'IN_TRANSIT') nextStatus = OrderStatus.SHIPPED;

      if (nextStatus !== order.status) {
        const updated = await orderService.updateCourierInfo(orderId, { status: nextStatus });
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        showToast(`Status updated to ${nextStatus}`);
      } else {
        showToast(`Current status: ${apiStatus.toUpperCase()}`);
      }
    } catch (err: any) {
      showToast("Tracking failed", 'error');
    }
  }, [orders, courierConfigs, showToast]);

  /**
   * Steadfast Test Connection Handler
   */
  const handleTestSteadfast = useCallback(async (config: CourierConfig) => {
    try {
      const success = await steadfastService.testConnection(config.apiKey, config.storeId || "");
      if (success) {
        showToast("Steadfast API Connection Successful!");
      } else {
        showToast("Steadfast API Connection Failed. Check Keys.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Test failed", "error");
    }
  }, [showToast]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedOrderId(null);
  };

  if (!currentUser) {
    return (
      <>
        <LoginView lang={lang} onLogin={handleLogin} showToast={showToast} />
        {toast && (
          <div className={`fixed bottom-6 right-6 z-[100] px-6 py-3 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-bottom duration-200 ${toast.type === 'success' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-red-600 text-white border-red-500'}`}>
            <span className="font-bold text-[10px] uppercase tracking-widest">{toast.message}</span>
          </div>
        )}
      </>
    );
  }

  const renderContent = () => {
    if (loading) return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse uppercase text-[10px] tracking-widest">Purnata Syncing...</p>
      </div>
    );

    const isPermitted = currentUser.permissions.includes(activeTab);
    if (!isPermitted) return <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest">Restricted Access Module</div>;

    switch (activeTab) {
      case 'dashboard': return <DashboardView lang={lang} orders={orders} products={products} incomes={incomes} expenses={expenses} loans={loans} />;
      case 'orders': 
        if (selectedOrderId) {
          return <OrderDetailsView 
            lang={lang} 
            orderId={selectedOrderId} 
            onBack={() => setSelectedOrderId(null)} 
            products={products}
            onUpdateStatus={handleUpdateOrderStatus}
            onBookCourier={handleBookSteadfast}
          />;
        }
        return <OrdersView 
          lang={lang} 
          orders={orders} 
          products={products} 
          onAddOrder={handleAddOrder} 
          onUpdateStatus={handleUpdateOrderStatus} 
          onBookSteadfast={handleBookSteadfast} 
          onTrackSteadfast={handleTrackSteadfast} 
          onViewOrder={setSelectedOrderId}
        />;
      case 'inventory': return <InventoryView lang={lang} products={products} onAddProduct={async (p) => { const np = await productService.create(p); setProducts(prev => [np, ...prev]); showToast("Product added"); }} />;
      case 'logistics': return <LogisticsView lang={lang} orders={orders} onUpdateStatus={handleUpdateOrderStatus} onTrackSteadfast={handleTrackSteadfast} />;
      case 'customers': return <CustomersView lang={lang} customers={customers} />;
      case 'financials': return <FinancialsView lang={lang} incomes={incomes} onAddIncome={async (i) => { const ni = await financeService.createIncome(i); setIncomes(prev => [ni, ...prev]); showToast("Income added"); }} expenses={expenses} onAddExpense={async (e) => { const ne = await financeService.createExpense(e); setExpenses(prev => [ne, ...prev]); showToast("Expense added"); }} orders={orders} />;
      case 'loans': return <LoansView lang={lang} loans={loans} role={currentUser!.role} onAddLoan={async (l) => { const nl = await financeService.createLoan(l); setLoans(prev => [nl, ...prev]); showToast("Loan created"); }} onPayLoan={async (id, amt) => { const ul = await financeService.updateLoan(id, { paidAmount: (loans.find(l => l.id === id)?.paidAmount || 0) + amt }); setLoans(prev => prev.map(l => l.id === id ? ul : l)); showToast("Payment recorded"); }} />;
      case 'staff': return <StaffView lang={lang} users={users} currentUser={currentUser!} onAddUser={async (u) => { const nu = await userService.create(u); setUsers(prev => [...prev, nu]); showToast("User added"); }} onDeleteUser={async (id) => { await userService.delete(id); setUsers(prev => prev.filter(u => u.id !== id)); showToast("User removed"); }} />;
      case 'settings': return <SettingsView lang={lang} courierConfigs={courierConfigs} onUpdateCourier={async (type, up) => { await courierService.update(type, up); setCourierConfigs(await courierService.getAll()); showToast("Settings updated"); }} onTestSteadfast={handleTestSteadfast} />;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <Sidebar lang={lang} activeTab={activeTab} setActiveTab={handleTabChange} user={currentUser} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header lang={lang} setLang={setLang} user={currentUser} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] px-6 py-3 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-bottom duration-200 ${toast.type === 'success' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-red-600 text-white border-red-500'}`}>
          <span className="font-bold text-[10px] uppercase tracking-widest">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default App;
