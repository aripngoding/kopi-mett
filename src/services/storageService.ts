import { Order, TableReservation, CafeTable, InventoryItem, MenuItem } from '../types';
import { INITIAL_MENU_ITEMS, INITIAL_TABLES, INITIAL_RESERVATIONS, INITIAL_ORDERS, INITIAL_INVENTORY } from '../data/mockData';

const STORAGE_KEYS = {
  ORDERS: 'kopi_ruang_orders',
  RESERVATIONS: 'kopi_ruang_reservations',
  TABLES: 'kopi_ruang_tables',
  INVENTORY: 'kopi_ruang_inventory',
  MENU: 'kopi_ruang_menu',
};

// Safe LocalStorage helpers
function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event for cross-component reactive updates
    window.dispatchEvent(new Event('kopi_ruang_sync'));
  } catch {
    // ignore
  }
}

export const StorageService = {
  // Menu
  getMenuItems: (): MenuItem[] => {
    return getStoredItem<MenuItem[]>(STORAGE_KEYS.MENU, INITIAL_MENU_ITEMS);
  },
  saveMenuItems: (items: MenuItem[]) => {
    setStoredItem(STORAGE_KEYS.MENU, items);
  },
  toggleItemStock: (id: string) => {
    const items = StorageService.getMenuItems();
    const updated = items.map(it => it.id === id ? { ...it, inStock: !it.inStock } : it);
    StorageService.saveMenuItems(updated);
    return updated;
  },

  // Tables
  getTables: (): CafeTable[] => {
    return getStoredItem<CafeTable[]>(STORAGE_KEYS.TABLES, INITIAL_TABLES);
  },
  saveTables: (tables: CafeTable[]) => {
    setStoredItem(STORAGE_KEYS.TABLES, tables);
  },
  updateTableStatus: (tableId: string, status: CafeTable['status']) => {
    const tables = StorageService.getTables();
    const updated = tables.map(t => t.id === tableId ? { ...t, status } : t);
    StorageService.saveTables(updated);
    return updated;
  },

  // Reservations
  getReservations: (): TableReservation[] => {
    return getStoredItem<TableReservation[]>(STORAGE_KEYS.RESERVATIONS, INITIAL_RESERVATIONS);
  },
  saveReservations: (reservations: TableReservation[]) => {
    setStoredItem(STORAGE_KEYS.RESERVATIONS, reservations);
  },
  createReservation: (data: Omit<TableReservation, 'id' | 'bookingCode' | 'createdAt'>): TableReservation => {
    const current = StorageService.getReservations();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const newReservation: TableReservation = {
      ...data,
      id: `res-${Date.now()}`,
      bookingCode: `RSV-${randomSuffix}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newReservation, ...current];
    StorageService.saveReservations(updated);

    // Update table status to reserved
    StorageService.updateTableStatus(data.tableId, 'reserved');

    return newReservation;
  },
  updateReservationStatus: (id: string, status: TableReservation['status']) => {
    const current = StorageService.getReservations();
    let updatedTableId: string | null = null;
    const updated = current.map(r => {
      if (r.id === id) {
        updatedTableId = r.tableId;
        return { ...r, status };
      }
      return r;
    });
    StorageService.saveReservations(updated);

    if (updatedTableId) {
      if (status === 'checked_in') {
        StorageService.updateTableStatus(updatedTableId, 'occupied');
      } else if (status === 'completed' || status === 'cancelled') {
        StorageService.updateTableStatus(updatedTableId, 'available');
      }
    }
    return updated;
  },

  // Orders
  getOrders: (): Order[] => {
    return getStoredItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },
  saveOrders: (orders: Order[]) => {
    setStoredItem(STORAGE_KEYS.ORDERS, orders);
  },
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order => {
    const orders = StorageService.getOrders();
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randNum = String(Math.floor(100 + Math.random() * 900));
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `KPR-${dateStr}-${randNum}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newOrder, ...orders];
    StorageService.saveOrders(updated);

    // If dine in with table number, lock table as occupied
    if (orderData.type === 'dine_in' && orderData.tableNumber) {
      const tables = StorageService.getTables();
      const targetTable = tables.find(t => t.number.toLowerCase() === orderData.tableNumber?.toLowerCase());
      if (targetTable) {
        StorageService.updateTableStatus(targetTable.id, 'occupied');
      }
    }

    return newOrder;
  },
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => {
    const orders = StorageService.getOrders();
    const updated = orders.map(o => o.id === orderId ? { ...o, orderStatus: status } : o);
    StorageService.saveOrders(updated);
    return updated;
  },
  updatePaymentStatus: (orderId: string, paymentStatus: Order['paymentStatus']) => {
    const orders = StorageService.getOrders();
    const updated = orders.map(o => o.id === orderId ? {
      ...o,
      paymentStatus,
      paidAt: paymentStatus === 'paid' ? new Date().toISOString() : o.paidAt,
      orderStatus: paymentStatus === 'paid' && o.orderStatus === 'received' ? 'preparing' : o.orderStatus
    } : o);
    StorageService.saveOrders(updated);
    return updated;
  },

  // Inventory
  getInventory: (): InventoryItem[] => {
    return getStoredItem<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
  },
  saveInventory: (inventory: InventoryItem[]) => {
    setStoredItem(STORAGE_KEYS.INVENTORY, inventory);
  },
  updateStock: (id: string, newStock: number) => {
    const items = StorageService.getInventory();
    const updated = items.map(item => {
      if (item.id === id) {
        const currentStock = Math.max(0, newStock);
        let status: InventoryItem['status'] = 'safe';
        if (currentStock === 0) status = 'out_of_stock';
        else if (currentStock <= item.minStock) status = 'low';
        return { ...item, currentStock, status };
      }
      return item;
    });
    StorageService.saveInventory(updated);
    return updated;
  },
};

// Currency Formatter
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount).replace('IDR', 'Rp');
}

// Generate WhatsApp Link & Message
export function generateWhatsAppOrderMessage(order: Order): { url: string; rawText: string } {
  const itemsText = order.items.map((ci, idx) => {
    const customizations: string[] = [];
    if (ci.customization.ice) customizations.push(`Ice: ${ci.customization.ice}`);
    if (ci.customization.sugar) customizations.push(`Sugar: ${ci.customization.sugar}`);
    if (ci.customization.milk) customizations.push(`Susu: ${ci.customization.milk.replace('_', ' ')}`);
    if (ci.customization.extraShot) customizations.push('+1 Shot Espresso');
    if (ci.customization.spiceLevel) customizations.push(`Level: ${ci.customization.spiceLevel}`);
    const detail = customizations.length > 0 ? ` (${customizations.join(', ')})` : '';
    return `${idx + 1}. *${ci.item.name}* x${ci.quantity} = ${formatIDR(ci.itemTotal)}${detail}`;
  }).join('\n');

  const paymentName = order.paymentMethod.toUpperCase().replace('_', ' ');
  const statusEmoji = order.paymentStatus === 'paid' ? '✅ LUNAS' : '⏳ MENUNGGU PEMBAYARAN';

  const rawText = `*☕ KOPI & RUANG - KONFIRMASI PESANAN*
────────────────────────
Halo *${order.customerName}*, terima kasih telah memesan di Kopi & Ruang!

📄 *No. Pesanan:* ${order.orderNumber}
🛎️ *Tipe:* ${order.type === 'dine_in' ? `Dine-In (Meja ${order.tableNumber || '-'})` : 'Takeaway (Bawa Pulang)'}
💳 *Metode Bayar:* ${paymentName}
📊 *Status:* ${statusEmoji}
⏰ *Estimasi Siap:* ${order.estimatedReadyTime} WIB

*Rincian Pesanan:*
${itemsText}

────────────────────────
Subtotal: ${formatIDR(order.subtotal)}
Diskon: -${formatIDR(order.discount)}
PB1 (10%): ${formatIDR(order.tax)}
Service: ${formatIDR(order.serviceFee)}
*TOTAL AKHIR:* *${formatIDR(order.total)}*
────────────────────────
${order.notes ? `📝 Catatan: _"${order.notes}"_\n` : ''}
📍 _Kopi & Ruang Senopati, Jl. Suryo No. 42, Jakarta Selatan_
🔗 Pantau status pesanan secara real-time di web kami.`;

  // Standardize phone number for WhatsApp link
  let phone = order.customerPhone.replace(/[^0-9]/g, '');
  if (phone.startsWith('0')) {
    phone = '62' + phone.slice(1);
  } else if (!phone.startsWith('62')) {
    phone = '62' + phone;
  }

  const encoded = encodeURIComponent(rawText);
  return {
    url: `https://wa.me/${phone}?text=${encoded}`,
    rawText,
  };
}

// Generate WhatsApp Reservation Message
export function generateWhatsAppReservationMessage(res: TableReservation): { url: string; rawText: string } {
  const rawText = `*☕ KOPI & RUANG - KONFIRMASI RESERVASI MEJA*
────────────────────────
Halo *${res.customerName}*, reservasi meja Anda telah TERKONFIRMASI!

🎫 *Kode Booking:* *${res.bookingCode}*
🪑 *Meja:* ${res.tableNumber} (Area ${res.area.toUpperCase()})
📅 *Tanggal:* ${res.date}
⏰ *Jam:* ${res.timeSlot} WIB
👥 *Jumlah Tamu:* ${res.guestsCount} Orang
${res.specialRequests ? `📝 *Permintaan Khusus:* _"${res.specialRequests}"_\n` : ''}
────────────────────────
*Ketentuan Reservasi:*
1. Meja akan ditahan hingga 15 menit dari jam booking.
2. Tunjukkan kode booking ini kepada barista / greeter kami saat tiba.
3. Untuk reschedule atau pembatalan, silakan balas chat ini.

📍 _Kopi & Ruang - Jl. Suryo No. 42, Senopati, Jakarta Selatan_
Sampai jumpa menikmati kopi terbaik kami!`;

  let phone = res.customerPhone.replace(/[^0-9]/g, '');
  if (phone.startsWith('0')) {
    phone = '62' + phone.slice(1);
  } else if (!phone.startsWith('62')) {
    phone = '62' + phone;
  }

  return {
    url: `https://wa.me/${phone}?text=${encodeURIComponent(rawText)}`,
    rawText,
  };
}
