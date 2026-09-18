import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Printer, CheckCircle, Coffee, ShieldCheck } from 'lucide-react';
import { Order } from '../../types';
import { formatIDR } from '../../services/storageService';

interface EmailNotificationPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const EmailNotificationPreview: React.FC<EmailNotificationPreviewProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Email Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg rounded-3xl overflow-hidden bg-stone-900 border border-white/20 text-stone-100 shadow-2xl z-10 my-8 flex flex-col"
          >
            {/* Fake Email Client Top Bar */}
            <div className="p-4 bg-stone-950 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>To: <strong className="text-stone-200">{order.customerEmail}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  title="Cetak Faktur"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Email Body Content */}
            <div className="p-6 sm:p-8 bg-stone-900 max-h-[70vh] overflow-y-auto space-y-6 text-stone-200 text-xs">
              
              {/* Header Letterhead */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-display text-white">KOPI & RUANG</h3>
                    <p className="text-[10px] text-stone-400">Artisanal Roastery & Cafe</p>
                  </div>
                </div>
                <div className="text-right text-[11px] text-stone-400">
                  <span className="block font-mono font-bold text-amber-400">{order.orderNumber}</span>
                  <span>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-300">Pembayaran Berhasil Dikonfirmasi</h4>
                  <p className="text-[11px] text-emerald-400/80">
                    Pesanan Anda langsung diproses oleh tim barista kami.
                  </p>
                </div>
              </div>

              {/* Customer & Order Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 text-[11px]">
                <div>
                  <span className="text-stone-500 block">Nama Pemesan:</span>
                  <span className="font-bold text-stone-200">{order.customerName}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Tipe Layanan:</span>
                  <span className="font-bold text-stone-200">
                    {order.type === 'dine_in' ? `Dine-In (Meja ${order.tableNumber})` : 'Takeaway (Bawa Pulang)'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Metode Pembayaran:</span>
                  <span className="font-bold text-stone-200 uppercase">{order.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Estimasi Siap:</span>
                  <span className="font-bold text-amber-400">{order.estimatedReadyTime} WIB</span>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="space-y-2">
                <div className="flex justify-between font-semibold text-stone-400 border-b border-white/10 pb-1 text-[11px]">
                  <span>Item Pesanan</span>
                  <span>Total</span>
                </div>

                <div className="space-y-2">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-start py-1">
                      <div>
                        <span className="font-medium text-white">{it.item.name}</span>
                        <span className="text-stone-400 block text-[10px]">
                          x{it.quantity} @ {formatIDR(it.item.price)}
                        </span>
                      </div>
                      <span className="font-medium text-stone-200">{formatIDR(it.itemTotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculation Breakdown */}
              <div className="pt-3 border-t border-white/10 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-stone-400">
                  <span>Subtotal</span>
                  <span>{formatIDR(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Diskon Promo</span>
                    <span>-{formatIDR(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-400">
                  <span>PB1 Restoran (10%)</span>
                  <span>{formatIDR(order.tax)}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Biaya Layanan</span>
                  <span>{formatIDR(order.serviceFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                  <span>Total Tagihan (Lunas)</span>
                  <span className="text-amber-400 font-display">{formatIDR(order.total)}</span>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center pt-4 border-t border-white/10 text-[10px] text-stone-400 space-y-1">
                <p>📍 Kopi & Ruang Senopati - Jl. Suryo No. 42, Jakarta Selatan</p>
                <p>Terima kasih atas kunjungan Anda. Selamat menikmati waktu bersantai!</p>
              </div>

            </div>

            {/* Modal Bottom Close */}
            <div className="p-4 bg-stone-950 border-t border-white/10 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-semibold"
              >
                Tutup Invoice
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
