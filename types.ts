
export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  ACCOUNTS = 'ACCOUNTS',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export enum OrderSource {
  MANUAL = 'MANUAL',
  WEBSITE = 'WEBSITE',
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  WHATSAPP = 'WHATSAPP'
}

export enum FinanceCategory {
  SALES = 'SALES',
  SERVICE = 'SERVICE',
  RENT = 'RENT',
  SALARY = 'SALARY',
  MARKETING = 'MARKETING',
  TRANSPORT = 'TRANSPORT',
  UTILITY = 'UTILITY',
  OTHER = 'OTHER'
}

export enum PaymentMethod {
  CASH = 'CASH',
  BKASH = 'BKASH',
  BANK = 'BANK',
  NAGAD = 'NAGAD'
}

export enum CourierType {
  PATHAO = 'PATHAO',
  STEADFAST = 'STEADFAST',
  REDX = 'REDX'
}

export interface CourierConfig {
  type: CourierType;
  apiKey: string;
  storeId?: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  warehouseId: string;
  lowStockAlert: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  district: string;
  thana: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number; // Grand Total (Products + Delivery)
  status: OrderStatus;
  source: OrderSource;
  courierId?: string;
  courierType?: CourierType;
  trackingId?: string;
  codAmount: number;
  deliveryCharge: number;
  advancePayment: number;
  createdAt: string;
  note?: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: FinanceCategory;
  date: string;
  method: PaymentMethod;
  note: string;
}

export interface Income {
  id: string;
  amount: number;
  source: FinanceCategory;
  date: string;
  method: PaymentMethod;
  note: string;
}

export interface Loan {
  id: string;
  provider: string;
  amount: number;
  interestRate: number;
  monthlyInstallment: number;
  paidAmount: number;
  startDate: string;
  endDate: string;
  // Fix: Renamed next_payment_date to nextPaymentDate for camelCase consistency with other Loan properties
  nextPaymentDate: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[]; // List of tab IDs
  lastActive: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  isFlagged: boolean;
  history: string[];
}

export type Language = 'EN' | 'BN';
