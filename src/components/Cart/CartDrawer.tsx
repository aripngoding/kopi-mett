import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, Tag, Check, ShoppingBag, Utensils, Package, Sparkles } from 'lucide-react';
import { CartItem, CafeTable } from '../../types';
import { formatIDR } from '../../services/storageService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  tables: CafeTable[];
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onProceedToPayment: (orderDetails: {
    type: 'dine_in' | 'takeaway';
    tableNumber?: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    notes?: string;
    subtotal: number;
    discount: number;
    tax: number;
    serviceFee: number;
    total: number;
  }) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  tables,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToPayment,
}) => {
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [tableNumber, setTableNumber] = useState<string>('01');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('nurularif629@gmail.com');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Promo code
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountRate?: number; flatDiscount?: number } | null>(null);
  const [promoError, setPromoError] = useState<string>('');

  // Subtotals
  const subtotal = cart.reduce((acc, item) => acc + item.itemTotal, 0);

  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountRate) {
      discount = Math.round(subtotal * appliedPromo.discountRate);
    } else if (appliedPromo.flatDiscount) {
      discount = Math.min(subtotal, appliedPromo.flatDiscount);
    }
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * 0.1); // PB1 10%
  const serviceFee = orderType === 'takeaway' ? 2000 : 3000;
  const grandTotal = taxableAmount + tax + serviceFee;

  const handleApplyPromo = () => {
    setPromoError('');
    const clean = promoCode.trim().toUpperCase();
    if (clean === 'KOPIBARU') {
      setAppliedPromo({ code: 'KOPIBARU', discountRate: 0.15 });
    } else if (clean === 'HEMAT10') {
      setAppliedPromo({ code: 'HEMAT10', flatDiscount: 10000 });
    } else if (clean === 'SENINHEMAT') {
      setAppliedPromo({ code: 'SENINHEMAT', discountRate: 0.2 });
    } else {
      setPromoError('Kode promo tidak valid atau kadaluarsa.');
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Mohon isi nama Anda untuk kemudahan pesanan.');
      return;
    }
    if (!customerPhone.trim()) {
      alert('Mohon masukkan nomor WhatsApp untuk notifikasi otomatis.');
      return;
    }

    onProceedToPayment({
      type: orderType,
      tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      notes: orderNotes.trim() || undefined,
      subtotal,
      discount,
      tax,
      serviceFee,
      total: grandTotal,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer Window */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-md h-full bg-[#140f0c] border-l border-white/10 shadow-2xl flex flex-col z-10 text-stone-100"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#18120e]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-lg font-display text-white">Keranjang Pesanan</h2>
                  <p className="text-xs text-stone-400">{cart.length} menu dipilih</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-stone-500 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-stone-300 text-lg mb-1">Keranjang Masih Kosong</h3>
                <p className="text-xs text-stone-400 max-w-xs mb-6">
                  Silakan pilih sajian kopi, pastry lezat, atau makanan favorit Anda untuk mulai memesan.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl glass-button-primary text-xs font-bold"
                >
                  Lihat Menu Sekarang
                </button>
              </div>
            ) : (
              <form onSubmit={handleCheckout} className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* Dine-in vs Takeaway Toggle */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Tipe Pesanan
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setOrderType('dine_in')}
                      className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        orderType === 'dine_in'
                          ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                          : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      <Utensils className="w-4 h-4" />
                      <span>Dine-In (Di Tempat)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('takeaway')}
                      className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        orderType === 'takeaway'
                          ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                          : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      <span>Takeaway (Bawa Pulang)</span>
                    </button>
                  </div>
                </div>

                {/* Table Number (if Dine-in) */}
                {orderType === 'dine_in' && (
                  <div className="space-y-1.5 p-3 rounded-2xl bg-white/5 border border-white/10">
                    <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                      <span>Pilih Nomor Meja Anda:</span>
                      <span className="text-[10px] text-amber-400">Lihat nomor di atas meja</span>
                    </label>
                    <select
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-sm text-stone-200"
                    >
                      {tables.map((t) => (
                        <option key={t.id} value={t.number} className="bg-stone-900 text-white">
                          Meja {t.number} - {t.name} ({t.capacity} Kursi)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Cart Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                      Daftar Menu ({cart.length})
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {cart.map((cartItem) => (
                      <div
                        key={cartItem.cartId}
                        className="p-3.5 rounded-2xl glass-card flex gap-3 items-center"
                      >
                        <img
                          src={cartItem.item.image}
                          alt={cartItem.item.name}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">
                            {cartItem.item.name}
                          </h4>
                          
                          {/* Customization details */}
                          <div className="text-[11px] text-stone-400 line-clamp-1">
                            {cartItem.customization.ice && `Ice: ${cartItem.customization.ice} • `}
                            {cartItem.customization.sugar && `Sugar: ${cartItem.customization.sugar} • `}
                            {cartItem.customization.milk && `${cartItem.customization.milk.replace('_', ' ')} • `}
                            {cartItem.customization.extraShot && `+1 Shot • `}
                            {cartItem.customization.spiceLevel && `Level: ${cartItem.customization.spiceLevel}`}
                          </div>

                          <div className="text-xs font-bold text-amber-400 mt-1">
                            {formatIDR(cartItem.itemTotal)}
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(cartItem.cartId, -1)}
                            className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-white">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(cartItem.cartId, 1)}
                            className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => onRemoveItem(cartItem.cartId)}
                          className="p-2 text-stone-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Contact Details */}
                <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Informasi Pelanggan (Untuk Notifikasi Real-Time)
                  </span>

                  <div>
                    <label className="text-[11px] text-stone-300 block mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Arif Nurul"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-300 block mb-1">Nomor WhatsApp * (Notifikasi Otomatis)</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 081234567890"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-300 block mb-1">Email (Kirim Invoice Digital)</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. arif@email.com"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-300 block mb-1">Catatan Tambahan</label>
                    <input
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="e.g. Tolong siapkan sedotan ramah lingkungan..."
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>

                {/* Voucher / Promo Code */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Kode Promo / Voucher</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Coba: KOPIBARU"
                      className="flex-1 px-3 py-2 rounded-xl glass-input text-xs uppercase font-mono tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-stone-950 font-bold text-xs transition-all"
                    >
                      Terapkan
                    </button>
                  </div>
                  {appliedPromo && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                      <Check className="w-3.5 h-3.5" />
                      <span>Voucher <strong>{appliedPromo.code}</strong> berhasil dipasang!</span>
                    </div>
                  )}
                  {promoError && (
                    <p className="text-xs text-red-400">{promoError}</p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="p-4 rounded-2xl bg-[#18120e] border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-400">
                    <span>Subtotal Menu</span>
                    <span>{formatIDR(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Potongan Diskon</span>
                      <span>-{formatIDR(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-400">
                    <span>Pajak Restoran (PB1 10%)</span>
                    <span>{formatIDR(tax)}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Biaya Layanan & {orderType === 'takeaway' ? 'Kemasan' : 'Meja'}</span>
                    <span>{formatIDR(serviceFee)}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                    <span>Total Pembayaran</span>
                    <span className="text-amber-400 font-display text-base">{formatIDR(grandTotal)}</span>
                  </div>
                </div>

                {/* Submit Checkout Button */}
                <div className="pt-2 pb-6">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-2xl glass-button-primary font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-2xl"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Pilih Pembayaran Digital ({formatIDR(grandTotal)})</span>
                  </motion.button>
                  <p className="text-[11px] text-center text-stone-400 mt-2">
                    Mendukung QRIS instan, GoPay, OVO, DANA, & Transfer Bank VA
                  </p>
                </div>

              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
