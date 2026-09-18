import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, CheckCircle2, ChefHat, BellRing, Coffee, Search, Utensils, MessageSquare, Mail } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { formatIDR } from '../../services/storageService';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  currentOrderId?: string;
  onOpenWhatsApp: (order: Order) => void;
  onOpenEmail: (order: Order) => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  orders,
  currentOrderId,
  onOpenWhatsApp,
  onOpenEmail,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    currentOrderId || (orders.length > 0 ? orders[0].id : '')
  );
  const [searchCode, setSearchCode] = useState<string>('');

  const activeOrder = orders.find(
    (o) => o.id === selectedOrderId || (searchCode && o.orderNumber.toLowerCase().includes(searchCode.toLowerCase().trim()))
  ) || (orders.length > 0 ? orders[0] : null);

  const getStepProgress = (status: OrderStatus) => {
    switch (status) {
      case 'received': return 1;
      case 'preparing': return 2;
      case 'ready': return 3;
      case 'completed': return 4;
      default: return 1;
    }
  };

  const steps = [
    {
      id: 1,
      title: 'Pesanan Diterima',
      desc: 'Pesanan telah masuk & terverifikasi.',
      icon: BellRing,
    },
    {
      id: 2,
      title: 'Sedang Diracik',
      desc: 'Barista & Chef sedang menyiapkan menu Anda.',
      icon: ChefHat,
    },
    {
      id: 3,
      title: 'Siap Disajikan',
      desc: 'Sajian siap diantar ke meja atau diambil di pickup bar.',
      icon: Coffee,
    },
    {
      id: 4,
      title: 'Selesai',
      desc: 'Selamat menikmati sajian Kopi & Ruang!',
      icon: CheckCircle2,
    },
  ];

  const currentStep = activeOrder ? getStepProgress(activeOrder.orderStatus) : 1;

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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl rounded-3xl overflow-hidden glass-panel border border-white/15 text-stone-100 shadow-2xl z-10 my-8 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-[#18120e] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-white">
                    Pelacak Status Pesanan Real-Time
                  </h3>
                  <p className="text-xs text-stone-400">
                    Pantau proses racikan barista secara langsung
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Order Search / Quick Switch */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    placeholder="Cari no. pesanan (e.g. KPR-2609-084)..."
                    className="w-full pl-10 pr-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              {/* Order Card Information */}
              {activeOrder ? (
                <div className="space-y-6">
                  
                  {/* Top Status Header */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 to-stone-900/80 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 tracking-wider block">
                        NOMOR PESANAN
                      </span>
                      <h4 className="text-xl font-bold font-mono text-white">
                        {activeOrder.orderNumber}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                        <span>{activeOrder.customerName}</span>
                        <span>•</span>
                        <span>
                          {activeOrder.type === 'dine_in'
                            ? `Dine-In (Meja ${activeOrder.tableNumber})`
                            : 'Takeaway'}
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-stone-400 block">Estimasi Siap</span>
                      <span className="text-lg font-bold text-amber-300 font-display">
                        {activeOrder.estimatedReadyTime} WIB
                      </span>
                    </div>
                  </div>

                  {/* 4-Step Visual Progress Tracker */}
                  <div className="space-y-4 pt-2">
                    <div className="relative flex items-center justify-between">
                      {/* Connecting Line */}
                      <div className="absolute top-5 left-6 right-6 h-1 bg-white/10 -z-0">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                        />
                      </div>

                      {steps.map((step) => {
                        const isDone = currentStep >= step.id;
                        const isCurrent = currentStep === step.id;
                        const Icon = step.icon;

                        return (
                          <div key={step.id} className="flex flex-col items-center relative z-10">
                            <motion.div
                              animate={isCurrent ? { scale: [1, 1.12, 1] } : {}}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all ${
                                isDone
                                  ? 'bg-amber-500 border-amber-300 text-stone-950 font-bold shadow-lg shadow-amber-500/30'
                                  : 'bg-stone-900 border-white/15 text-stone-500'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </motion.div>
                            <span className={`text-[11px] font-semibold mt-2 text-center max-w-[80px] leading-tight ${
                              isDone ? 'text-amber-300' : 'text-stone-500'
                            }`}>
                              {step.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Active Step Description Card */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-stone-300 flex items-start gap-3 mt-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1 animate-ping flex-shrink-0" />
                      <div>
                        <strong className="text-white block mb-0.5">
                          Status Terkini: {steps[currentStep - 1].title}
                        </strong>
                        <p className="text-stone-400 leading-relaxed">
                          {steps[currentStep - 1].desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Item List Summary */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                      Rincian Pesanan
                    </span>
                    <div className="space-y-2">
                      {activeOrder.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/5 text-xs">
                          <div className="flex items-center gap-2">
                            <img src={it.item.image} alt={it.item.name} className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                              <span className="font-semibold text-white">{it.item.name}</span>
                              <span className="text-stone-400 block text-[10px]">x{it.quantity}</span>
                            </div>
                          </div>
                          <span className="font-bold text-amber-400">{formatIDR(it.itemTotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions for Resending Notification */}
                  <div className="pt-2 flex flex-wrap gap-2.5 justify-center">
                    <button
                      onClick={() => onOpenWhatsApp(activeOrder)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Notifikasi WhatsApp</span>
                    </button>
                    <button
                      onClick={() => onOpenEmail(activeOrder)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Lihat Invoice Email</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="text-center py-12 text-stone-400">
                  <Coffee className="w-12 h-12 text-stone-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-stone-300">Tidak ada data pesanan</p>
                  <p className="text-xs">Silakan lakukan pemesanan menu terlebih dahulu.</p>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 bg-[#18120e] border-t border-white/10 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl glass-button-primary font-bold text-xs"
              >
                Tutup Pelacak
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
