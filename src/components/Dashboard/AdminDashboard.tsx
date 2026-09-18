import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  ArrowUpRight, 
  Plus, 
  Minus, 
  Check, 
  Coffee, 
  Calendar,
  Sparkles,
  BarChart3,
  Layers,
  Archive
} from 'lucide-react';
import { Order, OrderStatus, TableReservation, InventoryItem, CafeTable, MenuItem } from '../../types';
import { formatIDR, StorageService } from '../../services/storageService';
import { SALES_SUMMARY } from '../../data/mockData';

interface AdminDashboardProps {
  orders: Order[];
  reservations: TableReservation[];
  inventory: InventoryItem[];
  tables: CafeTable[];
  menuItems: MenuItem[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onUpdateReservationStatus: (resId: string, newStatus: TableReservation['status']) => void;
  onUpdateStock: (itemId: string, newStock: number) => void;
  onToggleMenuAvailability: (menuId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  reservations,
  inventory,
  tables,
  menuItems,
  onUpdateOrderStatus,
  onUpdateReservationStatus,
  onUpdateStock,
  onToggleMenuAvailability,
}) => {
  const [activeDashboardTab, setActiveDashboardTab] = useState<'kds' | 'analytics' | 'inventory' | 'reservations'>('kds');
  const [kdsFilter, setKdsFilter] = useState<'all' | 'preparing' | 'ready' | 'received'>('all');

  // Calculate live metrics from stored orders
  const todayPaidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const todayRevenue = todayPaidOrders.reduce((sum, o) => sum + o.total, 0) || SALES_SUMMARY.todayRevenue;
  const activePreparingCount = orders.filter(o => o.orderStatus === 'preparing' || o.orderStatus === 'received').length;
  const occupiedTablesCount = tables.filter(t => t.status === 'occupied').length;
  const lowStockCount = inventory.filter(i => i.status === 'low' || i.status === 'out_of_stock').length;

  const filteredKdsOrders = orders.filter(o => {
    if (kdsFilter === 'all') return true;
    return o.orderStatus === kdsFilter;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Staff &amp; Barista Control Center
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Dashboard Operasional &amp; Manajemen
          </h2>
          <p className="text-xs text-stone-400">
            Kelola pesanan dapur (KDS), pantau analitik penjualan harian, reservasi, &amp; inventaris stok secara real-time.
          </p>
        </div>

        {/* Dashboard Nav Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 overflow-x-auto">
          {[
            { id: 'kds', label: 'Pesanan Dapur (KDS)', icon: Coffee, badge: activePreparingCount },
            { id: 'analytics', label: 'Grafik Penjualan', icon: BarChart3 },
            { id: 'reservations', label: 'Reservasi Meja', icon: Calendar, badge: reservations.filter(r => r.status === 'confirmed').length },
            { id: 'inventory', label: 'Inventaris Stok', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeDashboardTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDashboardTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-stone-900 text-amber-300' : 'bg-amber-500/30 text-amber-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="p-5 rounded-3xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium block">Total Pendapatan Hari Ini</span>
            <span className="text-xl sm:text-2xl font-bold text-amber-400 font-display mt-0.5 block">
              {formatIDR(todayRevenue)}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% dari kemarin</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="p-5 rounded-3xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium block">Pesanan Aktif Sedang Dibuat</span>
            <span className="text-xl sm:text-2xl font-bold text-white font-display mt-0.5 block">
              {activePreparingCount} Pesanan
            </span>
            <span className="text-[11px] text-amber-300 block mt-1">
              {orders.length} total pesanan hari ini
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="p-5 rounded-3xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium block">Okupansi Meja Dine-In</span>
            <span className="text-xl sm:text-2xl font-bold text-white font-display mt-0.5 block">
              {occupiedTablesCount} / {tables.length} Meja
            </span>
            <span className="text-[11px] text-stone-400 block mt-1">
              {Math.round((occupiedTablesCount / tables.length) * 100)}% Meja Terisi
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="p-5 rounded-3xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium block">Peringatan Stok Rendah</span>
            <span className={`text-xl sm:text-2xl font-bold font-display mt-0.5 block ${
              lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {lowStockCount} Bahan
            </span>
            <span className="text-[11px] text-stone-400 block mt-1">
              {lowStockCount > 0 ? 'Perlu restock segera' : 'Semua stok aman'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
            lowStockCount > 0 ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TAB 1: Kitchen Display System (KDS) / Ringkasan Pesanan Live */}
      {activeDashboardTab === 'kds' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <span>Kitchen &amp; Barista Display System (KDS)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  Live Feed
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Ubah status pesanan agar pelanggan mendapat notifikasi status pesanan secara real-time.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'received', label: 'Diterima' },
                { id: 'preparing', label: 'Sedang Diracik' },
                { id: 'ready', label: 'Siap Disajikan' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setKdsFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    kdsFilter === f.id
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredKdsOrders.map((order) => {
              return (
                <div
                  key={order.id}
                  className={`p-5 rounded-3xl glass-card flex flex-col justify-between border ${
                    order.orderStatus === 'preparing'
                      ? 'border-amber-500/50 bg-amber-950/20 ring-2 ring-amber-500/20'
                      : order.orderStatus === 'ready'
                      ? 'border-emerald-500/50 bg-emerald-950/20'
                      : 'border-white/10'
                  }`}
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                      <div>
                        <span className="font-mono text-sm font-bold text-amber-400 block">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {order.customerName}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider block ${
                          order.orderStatus === 'preparing'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                            : order.orderStatus === 'ready'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : order.orderStatus === 'completed'
                            ? 'bg-stone-800 text-stone-400'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}>
                          {order.orderStatus === 'preparing' ? 'Sedang Dibuat' :
                           order.orderStatus === 'ready' ? 'Siap Disajikan' :
                           order.orderStatus === 'completed' ? 'Selesai' : 'Pesanan Masuk'}
                        </span>
                        <span className="text-[10px] text-stone-400 mt-1 block">
                          {order.type === 'dine_in' ? `Meja ${order.tableNumber || '-'}` : 'Takeaway'}
                        </span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2 mb-4">
                      {order.items.map((ci, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-white/5 text-xs">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-white">
                              {ci.quantity}x {ci.item.name}
                            </span>
                            <span className="text-stone-400 text-[11px]">
                              {formatIDR(ci.itemTotal)}
                            </span>
                          </div>
                          {/* Modifiers */}
                          <div className="text-[11px] text-amber-300/80 mt-0.5 space-x-1">
                            {ci.customization.ice && <span>• Ice: {ci.customization.ice}</span>}
                            {ci.customization.sugar && <span>• Sugar: {ci.customization.sugar}</span>}
                            {ci.customization.milk && <span>• {ci.customization.milk.replace('_', ' ')}</span>}
                            {ci.customization.extraShot && <span>• +1 Espresso</span>}
                            {ci.customization.spiceLevel && <span>• Lv: {ci.customization.spiceLevel}</span>}
                          </div>
                          {ci.customization.notes && (
                            <p className="text-[10px] text-stone-400 italic mt-1 bg-black/20 p-1 rounded">
                              "{ci.customization.notes}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 mb-4">
                        <strong>Catatan Pelanggan:</strong> "{order.notes}"
                      </div>
                    )}
                  </div>

                  {/* Action Status Flow Buttons */}
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-400">
                      <span>Total: <strong className="text-white">{formatIDR(order.total)}</strong></span>
                      <span className="text-[10px]">Bayar: {order.paymentMethod.toUpperCase()}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {order.orderStatus === 'received' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                          className="col-span-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Coffee className="w-4 h-4" />
                          <span>Mulai Racik Menu</span>
                        </button>
                      )}

                      {order.orderStatus === 'preparing' && (
                        <>
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'ready')}
                            className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Siap Diantar</span>
                          </button>
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                            className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 font-semibold text-xs"
                          >
                            Langsung Selesai
                          </button>
                        </>
                      )}

                      {order.orderStatus === 'ready' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                          className="col-span-2 py-2 px-3 rounded-xl bg-stone-700 hover:bg-stone-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Tandai Selesai / Terhidang</span>
                        </button>
                      )}

                      {order.orderStatus === 'completed' && (
                        <span className="col-span-2 py-1.5 text-center text-xs text-stone-500 font-medium">
                          ✓ Pesanan Selesai Dilayani
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Grafik Penjualan Harian & Analitik */}
      {activeDashboardTab === 'analytics' && (
        <div className="space-y-8">
          
          {/* Main 7-Day Revenue Trend Bar Chart (Custom Clean SVG) */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                  Grafik Tren Penjualan Harian (7 Hari Terakhir)
                </h3>
                <p className="text-xs text-stone-400">
                  Total omset mingguan: <strong>Rp 38.950.000</strong> (Rata-rata 53 pesanan/hari)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Pertumbuhan +22.8% MoM
              </span>
            </div>

            {/* Custom Interactive SVG Bar Chart */}
            <div className="h-64 sm:h-72 w-full pt-4">
              <div className="h-full flex items-end justify-between gap-2 sm:gap-4 px-2">
                {SALES_SUMMARY.dailyTrend.map((item, index) => {
                  const maxRevenue = 9000000;
                  const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
                  const isToday = index === SALES_SUMMARY.dailyTrend.length - 1;

                  return (
                    <div key={item.day} className="flex-1 flex flex-col items-center h-full justify-end group">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-2 px-2.5 py-1.5 rounded-xl bg-stone-950 text-stone-100 text-[10px] font-mono border border-white/10 shadow-xl whitespace-nowrap pointer-events-none text-center">
                        <span className="font-bold text-amber-300 block">{formatIDR(item.revenue)}</span>
                        <span className="text-stone-400">{item.orders} Pesanan</span>
                      </div>

                      {/* Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[48px] rounded-t-2xl transition-all duration-500 relative ${
                          isToday
                            ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-lg shadow-amber-500/30'
                            : 'bg-white/15 hover:bg-white/30'
                        }`}
                      >
                        {isToday && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-stone-950 whitespace-nowrap">
                            Hari Ini
                          </div>
                        )}
                      </div>

                      {/* Day Label */}
                      <div className="mt-3 text-center">
                        <span className={`text-xs font-bold block ${isToday ? 'text-amber-300' : 'text-stone-400'}`}>
                          {item.day.split(' ')[0]}
                        </span>
                        <span className="text-[10px] text-stone-500 hidden sm:block">
                          {item.date}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Secondary Analytics: Peak Hours & Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Peak Hours Line/Histogram */}
            <div className="p-6 rounded-3xl glass-card space-y-4">
              <h4 className="text-base font-bold font-display text-white">
                Jam Ramai &amp; Distribusi Jam Sibuk
              </h4>
              <p className="text-xs text-stone-400">
                Waktu puncak pesanan berada pada jam makan siang (12:00) dan jam santai sore (18:00).
              </p>

              <div className="space-y-2.5 pt-2">
                {SALES_SUMMARY.hourlySales.map((slot) => {
                  const percent = Math.round((slot.orders / 15) * 100);
                  return (
                    <div key={slot.hour} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-mono text-stone-300">{slot.hour} WIB</span>
                        <span className="font-semibold text-amber-300">{slot.orders} Pesanan ({formatIDR(slot.revenue)})</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Revenue Breakdown */}
            <div className="p-6 rounded-3xl glass-card space-y-4">
              <h4 className="text-base font-bold font-display text-white">
                Kontribusi Pendapatan per Kategori
              </h4>
              <p className="text-xs text-stone-400">
                Signature Coffee menyumbang 38% pendapatan terbesar cafe.
              </p>

              <div className="space-y-3 pt-2">
                {SALES_SUMMARY.categoryBreakdown.map((cat) => (
                  <div key={cat.category} className="p-3 rounded-2xl bg-white/5 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-white">{cat.category}</span>
                      <span className="font-mono font-bold text-amber-400">{cat.percentage}% ({formatIDR(cat.revenue)})</span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
                      <div
                        style={{ width: `${cat.percentage}%` }}
                        className="h-full bg-amber-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: Manajemen Reservasi Meja */}
      {activeDashboardTab === 'reservations' && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                Daftar &amp; Kontrol Reservasi Meja
              </h3>
              <p className="text-xs text-stone-400">
                Kelola status kedatangan tamu (Check-in, Selesai, Batalkan) dan lepaskan meja kembali ke sistem.
              </p>
            </div>
            <span className="text-xs text-stone-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              {reservations.length} Data Reservasi Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="border-b border-white/10 text-stone-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3">Kode Booking</th>
                  <th className="py-3 px-3">Pelanggan</th>
                  <th className="py-3 px-3">Meja / Area</th>
                  <th className="py-3 px-3">Jadwal</th>
                  <th className="py-3 px-3">Tamu</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-3 font-mono font-bold text-amber-300">
                      {res.bookingCode}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-white block">{res.customerName}</span>
                      <span className="text-[11px] text-stone-400">{res.customerPhone}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-lg bg-white/10 font-bold text-stone-200">
                        Meja {res.tableNumber}
                      </span>
                      <span className="text-[10px] text-stone-400 block mt-0.5 uppercase">
                        Area {res.area}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="block text-stone-200 font-medium">{res.date}</span>
                      <span className="text-[11px] text-amber-400 font-bold">{res.timeSlot} WIB</span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold">
                      {res.guestsCount} Pax
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        res.status === 'confirmed' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        res.status === 'checked_in' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        res.status === 'completed' ? 'bg-stone-800 text-stone-400' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {res.status === 'confirmed' ? 'Terkonfirmasi' :
                         res.status === 'checked_in' ? 'Tamu Hadir' :
                         res.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-1.5">
                      {res.status === 'confirmed' && (
                        <button
                          onClick={() => onUpdateReservationStatus(res.id, 'checked_in')}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px]"
                        >
                          Check-In Tamu
                        </button>
                      )}
                      {res.status === 'checked_in' && (
                        <button
                          onClick={() => onUpdateReservationStatus(res.id, 'completed')}
                          className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 font-semibold text-[11px]"
                        >
                          Lepas Meja
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Manajemen Inventaris Intuitif */}
      {activeDashboardTab === 'inventory' && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                Manajemen Inventaris &amp; Bahan Baku
              </h3>
              <p className="text-xs text-stone-400">
                Pantau stok biji kopi specialty, susu, sirup organik, kemasan, dan sinkronkan ketersediaan menu secara otomatis.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="border-b border-white/10 text-stone-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3">Nama Bahan Baku</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Sisa Stok</th>
                  <th className="py-3 px-3">Batas Minimum</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Harga Beli / Unit</th>
                  <th className="py-3 px-3 text-right">Atur Jumlah Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {inventory.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-white block">{inv.name}</span>
                      <span className="text-[10px] text-stone-400">{inv.supplier}</span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-stone-400">
                      {inv.sku}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-base text-amber-300">
                        {inv.currentStock}
                      </span>{' '}
                      <span className="text-stone-400">{inv.unit}</span>
                    </td>
                    <td className="py-3.5 px-3 text-stone-400">
                      {inv.minStock} {inv.unit}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        inv.status === 'safe'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : inv.status === 'low'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {inv.status === 'safe' ? 'Stok Aman' :
                         inv.status === 'low' ? 'Stok Menipis' : 'Habis'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      {formatIDR(inv.costPerUnit)}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                          onClick={() => onUpdateStock(inv.id, inv.currentStock - 1)}
                          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                          title="Kurangi 1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onUpdateStock(inv.id, inv.currentStock + 5)}
                          className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-stone-950 font-bold text-[10px] transition-all"
                          title="Tambah +5 Unit"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => onUpdateStock(inv.id, inv.currentStock + 1)}
                          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                          title="Tambah 1"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Menu Item Availability Toggles */}
          <div className="pt-6 border-t border-white/10 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400">
              Sinkronisasi Ketersediaan Menu Online (Matikan jika bahan habis)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {menuItems.map((m) => (
                <div key={m.id} className="p-3 rounded-2xl bg-white/5 flex items-center justify-between">
                  <div className="truncate mr-2">
                    <span className="text-xs font-bold text-white block truncate">{m.name}</span>
                    <span className="text-[10px] text-stone-400">{formatIDR(m.price)}</span>
                  </div>
                  <button
                    onClick={() => onToggleMenuAvailability(m.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      m.inStock
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {m.inStock ? 'Tersedia' : 'Habis'}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
