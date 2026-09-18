import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, Smartphone, Building2, CheckCircle2, Copy, Check, Timer, ArrowRight, ShieldCheck, Download, Printer, MessageSquare, Mail } from 'lucide-react';
import { Order, PaymentMethod, CartItem } from '../../types';
import { formatIDR, StorageService } from '../../services/storageService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingOrderData: {
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
    items: CartItem[];
  } | null;
  onPaymentSuccess: (order: Order) => void;
  onOpenWhatsAppPreview: (order: Order) => void;
  onOpenEmailPreview: (order: Order) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  pendingOrderData,
  onPaymentSuccess,
  onOpenWhatsAppPreview,
  onOpenEmailPreview,
}) => {
  if (!pendingOrderData) return null;

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('qris');
  const [activeTab, setActiveTab] = useState<'qris' | 'ewallet' | 'va'>('qris');
  const [ewalletPhone, setEwalletPhone] = useState<string>(pendingOrderData.customerPhone || '081234567890');
  const [selectedBank, setSelectedBank] = useState<'bca' | 'mandiri' | 'bri' | 'bni'>('bca');
  
  // Payment Simulation States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paidOrder, setPaidOrder] = useState<Order | null>(null);
  const [copiedVA, setCopiedVA] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(15 * 60); // 15 mins

  // Virtual account generator
  const getVaNumber = (bank: string) => {
    const prefixes: Record<string, string> = {
      bca: '39010',
      mandiri: '88908',
      bri: '12800',
      bni: '98814',
    };
    const cleanPhone = pendingOrderData.customerPhone.replace(/[^0-9]/g, '').slice(-9);
    return `${prefixes[bank] || '39010'}${cleanPhone || '81234567'}`;
  };

  useEffect(() => {
    let timer: any;
    if (isOpen && countdownSeconds > 0 && !paidOrder) {
      timer = setInterval(() => {
        setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, countdownSeconds, paidOrder]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      let finalMethod: PaymentMethod = 'qris';
      if (activeTab === 'ewallet') {
        finalMethod = selectedMethod;
      } else if (activeTab === 'va') {
        finalMethod = `${selectedBank}_va` as PaymentMethod;
      }

      const orderNumberDate = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const randNum = String(Math.floor(100 + Math.random() * 900));

      const newOrder = StorageService.createOrder({
        type: pendingOrderData.type,
        tableNumber: pendingOrderData.tableNumber,
        customerName: pendingOrderData.customerName,
        customerPhone: pendingOrderData.customerPhone,
        customerEmail: pendingOrderData.customerEmail,
        items: pendingOrderData.items,
        subtotal: pendingOrderData.subtotal,
        discount: pendingOrderData.discount,
        tax: pendingOrderData.tax,
        serviceFee: pendingOrderData.serviceFee,
        total: pendingOrderData.total,
        paymentMethod: finalMethod,
        paymentStatus: 'paid',
        orderStatus: 'received',
        paidAt: new Date().toISOString(),
        estimatedReadyTime: new Date(Date.now() + 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: pendingOrderData.notes,
        paymentDetails: {
          referenceId: `TRX-${Date.now().toString().slice(-8)}`,
          vaNumber: activeTab === 'va' ? getVaNumber(selectedBank) : undefined,
        }
      });

      setIsProcessing(false);
      setPaidOrder(newOrder);
      onPaymentSuccess(newOrder);
    }, 1200);
  };

  const handleCopyVA = (va: string) => {
    navigator.clipboard.writeText(va);
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
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
            onClick={!isProcessing && !paidOrder ? onClose : undefined}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl rounded-3xl overflow-hidden glass-panel border border-white/15 text-stone-100 shadow-2xl z-10 my-8"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-[#18120e] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400">Payment Gateway Resmi & Aman</span>
                </div>
                <h3 className="text-xl font-bold font-display text-white">
                  {paidOrder ? 'Pembayaran Berhasil Diterima' : 'Pilih Metode Pembayaran'}
                </h3>
              </div>

              {!isProcessing && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* If Paid, Show Official Receipt */}
            {paidOrder ? (
              <div className="p-6 sm:p-8 space-y-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30"
                >
                  <CheckCircle2 className="w-12 h-12" />
                </motion.div>

                <div>
                  <h4 className="text-2xl font-bold font-display text-white mb-1">
                    Transaksi Sukses!
                  </h4>
                  <p className="text-xs text-stone-300">
                    No. Transaksi: <span className="font-mono font-bold text-amber-400">{paidOrder.orderNumber}</span>
                  </p>
                  <div className="text-3xl font-bold text-amber-400 font-display mt-3">
                    {formatIDR(paidOrder.total)}
                  </div>
                </div>

                {/* Receipt Details Box */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs space-y-2">
                  <div className="flex justify-between text-stone-400">
                    <span>Pelanggan</span>
                    <span className="text-white font-medium">{paidOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Tipe Pesanan</span>
                    <span className="text-white font-medium">
                      {paidOrder.type === 'dine_in' ? `Dine-In (Meja ${paidOrder.tableNumber})` : 'Takeaway'}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Metode Bayar</span>
                    <span className="text-white font-medium uppercase">{paidOrder.paymentMethod.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Waktu Pembayaran</span>
                    <span className="text-white font-medium">{new Date().toLocaleTimeString()} WIB</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Estimasi Siap</span>
                    <span className="text-emerald-400 font-bold">{paidOrder.estimatedReadyTime} WIB</span>
                  </div>
                </div>

                {/* Notifications Dispatch Buttons */}
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-stone-400">
                    Kirim bukti pembayaran & lacak status pesanan secara instan:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => onOpenWhatsAppPreview(paidOrder)}
                      className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Notifikasi WhatsApp</span>
                    </button>
                    <button
                      onClick={() => onOpenEmailPreview(paidOrder)}
                      className="py-3 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Invoice via Email</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-2xl glass-button-primary font-bold text-sm"
                  >
                    Buka Pelacak Status Pesanan
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Total amount banner with countdown */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 to-stone-900/80 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-stone-400 block font-medium">Total Tagihan</span>
                    <span className="text-2xl font-bold text-amber-400 font-display">
                      {formatIDR(pendingOrderData.total)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-xs text-stone-300 justify-end">
                      <Timer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sisa Waktu Bayar</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-amber-300">
                      {formatTimer(countdownSeconds)}
                    </span>
                  </div>
                </div>

                {/* Payment Category Navigation Tabs */}
                <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('qris');
                      setSelectedMethod('qris');
                    }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === 'qris'
                        ? 'bg-amber-500 text-stone-950 shadow-md'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QRIS Instan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('ewallet');
                      setSelectedMethod('gopay');
                    }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === 'ewallet'
                        ? 'bg-amber-500 text-stone-950 shadow-md'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>E-Wallet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('va');
                      setSelectedMethod('bca_va');
                    }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === 'va'
                        ? 'bg-amber-500 text-stone-950 shadow-md'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Transfer Bank</span>
                  </button>
                </div>

                {/* Tab 1: QRIS View */}
                {activeTab === 'qris' && (
                  <div className="space-y-4 text-center">
                    <div className="p-5 rounded-3xl bg-white text-stone-900 max-w-xs mx-auto shadow-2xl space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="font-extrabold text-xs tracking-wider text-red-600">QRIS</span>
                        <span className="text-[10px] font-semibold text-stone-600">NMID: ID10200849201</span>
                      </div>

                      {/* SVG Stylized QRIS Code */}
                      <div className="relative aspect-square w-full bg-white flex items-center justify-center p-2">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          {/* Corner squares */}
                          <rect x="5" y="5" width="25" height="25" fill="#000" />
                          <rect x="9" y="9" width="17" height="17" fill="#fff" />
                          <rect x="12" y="12" width="11" height="11" fill="#000" />

                          <rect x="70" y="5" width="25" height="25" fill="#000" />
                          <rect x="74" y="9" width="17" height="17" fill="#fff" />
                          <rect x="77" y="12" width="11" height="11" fill="#000" />

                          <rect x="5" y="70" width="25" height="25" fill="#000" />
                          <rect x="9" y="74" width="17" height="17" fill="#fff" />
                          <rect x="12" y="77" width="11" height="11" fill="#000" />

                          {/* Pattern Dots */}
                          <rect x="36" y="8" width="6" height="6" fill="#000" />
                          <rect x="46" y="12" width="6" height="6" fill="#000" />
                          <rect x="56" y="8" width="6" height="6" fill="#000" />
                          <rect x="36" y="24" width="6" height="6" fill="#000" />
                          <rect x="52" y="24" width="6" height="6" fill="#000" />
                          
                          <rect x="10" y="38" width="6" height="6" fill="#000" />
                          <rect x="22" y="44" width="6" height="6" fill="#000" />
                          <rect x="36" y="38" width="8" height="8" fill="#000" />
                          <rect x="58" y="42" width="6" height="6" fill="#000" />
                          <rect x="72" y="38" width="6" height="6" fill="#000" />
                          <rect x="84" y="46" width="6" height="6" fill="#000" />

                          <rect x="36" y="60" width="6" height="6" fill="#000" />
                          <rect x="50" y="62" width="8" height="8" fill="#000" />
                          <rect x="70" y="72" width="6" height="6" fill="#000" />
                          <rect x="82" y="72" width="6" height="6" fill="#000" />
                          <rect x="74" y="84" width="6" height="6" fill="#000" />
                          <rect x="42" y="80" width="8" height="8" fill="#000" />

                          {/* Center coffee badge */}
                          <circle cx="50" cy="50" r="11" fill="#d97706" />
                          <text x="50" y="54" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">☕</text>
                        </svg>
                      </div>

                      <div className="text-[10px] text-stone-600 font-medium pt-1 border-t">
                        KOPI & RUANG SENOPATI
                      </div>
                    </div>

                    <p className="text-xs text-stone-400">
                      Buka aplikasi BCA Mobile, GoPay, OVO, DANA, BCA, Livin Mandiri, atau m-Banking Anda, lalu scan kode QR di atas.
                    </p>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleSimulatePayment}
                      className="w-full py-3.5 px-6 rounded-2xl glass-button-primary font-bold text-sm flex items-center justify-center gap-2 shadow-xl"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>Memverifikasi Pembayaran Real-Time...</span>
                        </div>
                      ) : (
                        <span>Simulasikan Scan & Bayar QRIS Sekarang</span>
                      )}
                    </button>
                  </div>
                )}

                {/* Tab 2: E-Wallet View */}
                {activeTab === 'ewallet' && (
                  <div className="space-y-4">
                    <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                      Pilih Aplikasi E-Wallet
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'gopay', label: 'GoPay', color: 'from-emerald-600 to-teal-700' },
                        { id: 'ovo', label: 'OVO', color: 'from-purple-600 to-indigo-700' },
                        { id: 'dana', label: 'DANA', color: 'from-blue-600 to-cyan-700' },
                        { id: 'shopeepay', label: 'ShopeePay', color: 'from-orange-600 to-amber-700' },
                      ].map((ew) => (
                        <button
                          key={ew.id}
                          type="button"
                          onClick={() => setSelectedMethod(ew.id as PaymentMethod)}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            selectedMethod === ew.id
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                              : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${ew.color} text-white font-bold text-xs flex items-center justify-center mx-auto mb-1.5 shadow-md`}>
                            {ew.label[0]}
                          </div>
                          <span className="text-xs block">{ew.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-stone-300">
                        Nomor Handphone Terdaftar di {selectedMethod.toUpperCase()}
                      </label>
                      <input
                        type="tel"
                        value={ewalletPhone}
                        onChange={(e) => setEwalletPhone(e.target.value)}
                        placeholder="081234567890"
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleSimulatePayment}
                      className="w-full py-3.5 px-6 rounded-2xl glass-button-primary font-bold text-sm flex items-center justify-center gap-2 shadow-xl mt-4"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>Mengirim Push Notifikasi ke HP...</span>
                        </div>
                      ) : (
                        <span>Kirim Permintaan Bayar ke {selectedMethod.toUpperCase()}</span>
                      )}
                    </button>
                  </div>
                )}

                {/* Tab 3: Virtual Account Bank View */}
                {activeTab === 'va' && (
                  <div className="space-y-4">
                    <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                      Pilih Bank Virtual Account
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'bca', name: 'BCA VA' },
                        { id: 'mandiri', name: 'Mandiri' },
                        { id: 'bri', name: 'BRI BRIVA' },
                        { id: 'bni', name: 'BNI VA' },
                      ].map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBank(bank.id as any)}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            selectedBank === bank.id
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                              : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-xs font-semibold block">{bank.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* VA Number Box */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <span className="text-[11px] text-stone-400 block">Nomor Virtual Account ({selectedBank.toUpperCase()})</span>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-xl font-bold tracking-wider text-white">
                          {getVaNumber(selectedBank)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyVA(getVaNumber(selectedBank))}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all"
                        >
                          {copiedVA ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900/60 border border-white/5 text-[11px] text-stone-400 space-y-1">
                      <p className="font-semibold text-stone-300">Petunjuk Pembayaran Virtual Account:</p>
                      <p>1. Buka m-Banking atau ATM bank pilihan Anda.</p>
                      <p>2. Pilih menu <strong>Transfer &gt; Virtual Account</strong>.</p>
                      <p>3. Masukkan nomor VA di atas dan konfirmasi nama pesanan <strong>Kopi &amp; Ruang</strong>.</p>
                    </div>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleSimulatePayment}
                      className="w-full py-3.5 px-6 rounded-2xl glass-button-primary font-bold text-sm flex items-center justify-center gap-2 shadow-xl mt-4"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>Mengecek Status Mutasi Bank Real-Time...</span>
                        </div>
                      ) : (
                        <span>Konfirmasi Pembayaran Transfer Bank</span>
                      )}
                    </button>
                  </div>
                )}

              </div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
