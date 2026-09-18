export type MenuCategory = 
  | 'all'
  | 'coffee'
  | 'signature'
  | 'non_coffee'
  | 'pastry'
  | 'main_course'
  | 'snacks';

export interface MenuItem {
  id: string;
  name: string;
  category: 'coffee' | 'signature' | 'non_coffee' | 'pastry' | 'main_course' | 'snacks';
  price: number;
  description: string;
  image: string;
  rating: number;
  popular?: boolean;
  isNew?: boolean;
  vegetarian?: boolean;
  inStock: boolean;
  prepTimeMinutes: number;
  calories?: number;
  availableCustomizations?: {
    ice?: boolean;
    sugar?: boolean;
    milk?: boolean;
    extraShot?: boolean;
    spiceLevel?: boolean;
  };
}

export type IceLevel = 'normal' | 'less' | 'none';
export type SugarLevel = '100%' | '70%' | '50%' | '0%';
export type MilkOption = 'fresh_milk' | 'oat_milk' | 'almond_milk' | 'skim_milk';
export type SpiceLevel = 'tidak_pedas' | 'sedang' | 'pedas';

export interface CartItemCustomization {
  ice?: IceLevel;
  sugar?: SugarLevel;
  milk?: MilkOption;
  extraShot?: boolean;
  spiceLevel?: SpiceLevel;
  notes?: string;
}

export interface CartItem {
  cartId: string;
  item: MenuItem;
  quantity: number;
  customization: CartItemCustomization;
  itemTotal: number;
}

export type TableArea = 'indoor' | 'garden' | 'bar' | 'vip';
export type TableStatus = 'available' | 'occupied' | 'reserved';

export interface CafeTable {
  id: string;
  number: string;
  name: string;
  area: TableArea;
  capacity: number;
  status: TableStatus;
  hasPowerOutlet: boolean;
  isSmoking: boolean;
  position: {
    x: number; // percentage in floor plan
    y: number;
  };
}

export type ReservationStatus = 'confirmed' | 'checked_in' | 'completed' | 'cancelled';

export interface TableReservation {
  id: string;
  bookingCode: string;
  tableId: string;
  tableNumber: string;
  area: TableArea;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  guestsCount: number;
  specialRequests?: string;
  status: ReservationStatus;
  createdAt: string;
}

export type PaymentMethod = 
  | 'qris'
  | 'gopay'
  | 'ovo'
  | 'dana'
  | 'shopeepay'
  | 'bca_va'
  | 'mandiri_va'
  | 'bri_va'
  | 'bni_va';

export type PaymentStatus = 'unpaid' | 'processing' | 'paid' | 'failed';

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  type: 'dine_in' | 'takeaway';
  tableNumber?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number; // 10% PB1
  serviceFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  paidAt?: string;
  estimatedReadyTime: string;
  notes?: string;
  paymentDetails?: {
    vaNumber?: string;
    qrisUrl?: string;
    expiresAt?: string;
    referenceId: string;
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: 'beans' | 'dairy' | 'syrup' | 'pastry' | 'packaging' | 'kitchen';
  currentStock: number;
  minStock: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  lastRestocked: string;
  status: 'safe' | 'low' | 'out_of_stock';
}

export interface SalesSummary {
  todayRevenue: number;
  todayOrdersCount: number;
  activeTablesCount: number;
  totalTablesCount: number;
  lowStockItemsCount: number;
  averageOrderValue: number;
  hourlySales: {
    hour: string;
    orders: number;
    revenue: number;
  }[];
  dailyTrend: {
    day: string;
    date: string;
    revenue: number;
    orders: number;
  }[];
  categoryBreakdown: {
    category: string;
    percentage: number;
    revenue: number;
  }[];
}
