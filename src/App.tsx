import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MenuItem, 
  CartItem, 
  CartItemCustomization, 
  CafeTable, 
  Order, 
  TableReservation, 
  InventoryItem, 
  OrderStatus 
} from './types';
import { StorageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { MenuSection } from './components/Menu/MenuSection';
import { ItemCustomizerModal } from './components/Menu/ItemCustomizerModal';
import { CartDrawer } from './components/Cart/CartDrawer';
import { ReservationSection } from './components/TableReservation/ReservationSection';
import { PaymentModal } from './components/Payment/PaymentModal';
import { OrderTrackerModal } from './components/Tracker/OrderTrackerModal';
import { WhatsAppNotificationPreview } from './components/Notifications/WhatsAppNotificationPreview';
import { EmailNotificationPreview } from './components/Notifications/EmailNotificationPreview';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { Footer } from './components/Footer';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'menu' | 'reservation' | 'tracker' | 'dashboard'>('menu');

  // Central Application State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<CafeTable[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Modals
  const [selectedCustomizingItem, setSelectedCustomizingItem] = useState<MenuItem | null>(null);
  const [pendingOrderData, setPendingOrderData] = useState<any>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | undefined>(undefined);

  // Notification previews
  const [notificationData, setNotificationData] = useState<Order | TableReservation | null>(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState<boolean>(false);
  const [isEmailOpen, setIsEmailOpen] = useState<boolean>(false);
  const [emailOrder, setEmailOrder] = useState<Order | null>(null);

  // Initial load & subscription to central storage
  const loadState = () => {
    setMenuItems(StorageService.getMenuItems());
    setTables(StorageService.getTables());
    setOrders(StorageService.getOrders());
    setReservations(StorageService.getReservations());
    setInventory(StorageService.getInventory());
  };

  useEffect(() => {
    loadState();

    const handleSync = () => {
      loadState();
    };

    window.addEventListener('kopi_ruang_sync', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('kopi_ruang_sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Cart Handlers
  const handleAddToCart = (customization: CartItemCustomization, quantity: number, itemTotal: number) => {
    if (!selectedCustomizingItem) return;

    const newCartItem: CartItem = {
      cartId: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      item: selectedCustomizingItem,
      quantity,
      customization,
      itemTotal,
    };

    setCart((prev) => [...prev, newCartItem]);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartId === cartId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const singlePrice = item.itemTotal / item.quantity;
            return {
              ...item,
              quantity: newQty,
              itemTotal: Math.round(singlePrice * newQty),
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (cartId: string) => {
    setCart((prev) => prev.filter((it) => it.cartId !== cartId));
  };

  // Payment Flow
  const handleProceedToPayment = (orderDetails: any) => {
    setPendingOrderData({
      ...orderDetails,
      items: cart,
    });
    setIsCartOpen(false);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = (createdOrder: Order) => {
    // Clear cart
    setCart([]);
    loadState();
    setActiveTrackingOrderId(createdOrder.id);
  };

  // Open WhatsApp Preview
  const handleOpenWhatsAppPreview = (data: Order | TableReservation) => {
    setNotificationData(data);
    setIsWhatsAppOpen(true);
  };

  // Open Email Preview
  const handleOpenEmailPreview = (order: Order) => {
    setEmailOrder(order);
    setIsEmailOpen(true);
  };

  // Admin Actions
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    StorageService.updateOrderStatus(orderId, newStatus);
    loadState();
  };

  const handleUpdateReservationStatus = (resId: string, newStatus: TableReservation['status']) => {
    StorageService.updateReservationStatus(resId, newStatus);
    loadState();
  };

  const handleUpdateStock = (itemId: string, newStock: number) => {
    StorageService.updateStock(itemId, newStock);
    loadState();
  };

  const handleToggleMenuAvailability = (menuId: string) => {
    StorageService.toggleItemStock(menuId);
    loadState();
  };

  return (
    <div className="min-h-screen bg-[#0f0c0a] text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 bg-radial-ambient">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <MenuSection
                menuItems={menuItems}
                onSelectItem={(item) => setSelectedCustomizingItem(item)}
                onOpenReservation={() => setActiveTab('reservation')}
              />
            </motion.div>
          )}

          {activeTab === 'reservation' && (
            <motion.div
              key="reservation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ReservationSection
                tables={tables}
                onReservationCreated={(res) => {
                  loadState();
                }}
                onOpenWhatsAppPreview={handleOpenWhatsAppPreview}
              />
            </motion.div>
          )}

          {activeTab === 'tracker' && (
            <motion.div
              key="tracker"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="py-6"
            >
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold font-display text-white">
                    Lacak Status Pesanan Anda
                  </h2>
                  <p className="text-xs text-stone-400">
                    Cek perkembangan racikan kopi dan sajian dapur secara real-time.
                  </p>
                </div>

                <div className="p-6 rounded-3xl glass-panel border border-white/10 text-center">
                  <button
                    onClick={() => setIsTrackerOpen(true)}
                    className="px-6 py-3 rounded-2xl glass-button-primary font-bold text-sm shadow-xl"
                  >
                    Buka Panel Pelacak Pesanan Lengkap
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AdminDashboard
                orders={orders}
                reservations={reservations}
                inventory={inventory}
                tables={tables}
                menuItems={menuItems}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onUpdateReservationStatus={handleUpdateReservationStatus}
                onUpdateStock={handleUpdateStock}
                onToggleMenuAvailability={handleToggleMenuAvailability}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        tables={tables}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToPayment={handleProceedToPayment}
      />

      {/* Item Customizer Modal */}
      <ItemCustomizerModal
        item={selectedCustomizingItem}
        isOpen={!!selectedCustomizingItem}
        onClose={() => setSelectedCustomizingItem(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          setIsTrackerOpen(true);
        }}
        pendingOrderData={pendingOrderData}
        onPaymentSuccess={handlePaymentSuccess}
        onOpenWhatsAppPreview={handleOpenWhatsAppPreview}
        onOpenEmailPreview={handleOpenEmailPreview}
      />

      {/* Order Status Tracker Modal */}
      <OrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        orders={orders}
        currentOrderId={activeTrackingOrderId}
        onOpenWhatsApp={handleOpenWhatsAppPreview}
        onOpenEmail={handleOpenEmailPreview}
      />

      {/* WhatsApp Notification Preview Modal */}
      <WhatsAppNotificationPreview
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        data={notificationData}
      />

      {/* Email Invoice Preview Modal */}
      <EmailNotificationPreview
        isOpen={isEmailOpen}
        onClose={() => setIsEmailOpen(false)}
        order={emailOrder}
      />

      {/* Footer */}
      <Footer
        onOpenAdmin={() => setActiveTab('dashboard')}
        onOpenReservation={() => setActiveTab('reservation')}
      />

    </div>
  );
}
