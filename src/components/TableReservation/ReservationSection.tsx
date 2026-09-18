import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, Users, Sparkles, Check, CheckCircle2, ShieldCheck, MapPin, Zap, MessageSquare, AlertCircle, Coffee } from 'lucide-react';
import { CafeTable, TableArea, TableReservation } from '../../types';
import { StorageService, generateWhatsAppReservationMessage } from '../../services/storageService';

interface ReservationSectionProps {
  tables: CafeTable[];
  onReservationCreated: (reservation: TableReservation) => void;
  onOpenWhatsAppPreview: (res: TableReservation) => void;
}

export const ReservationSection: React.FC<ReservationSectionProps> = ({
  tables,
  onReservationCreated,
  onOpenWhatsAppPreview,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('19:00');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [selectedArea, setSelectedArea] = useState<TableArea | 'all'>('all');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Form inputs
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('nurularif629@gmail.com');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  const [confirmedReservation, setConfirmedReservation] = useState<TableReservation | null>(null);

  const timeSlots = [
    '09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:00', '20:30', '21:30'
  ];

  const filteredTables = tables.filter((t) => {
    if (selectedArea !== 'all' && t.area !== selectedArea) return false;
    return true;
  });

  const activeTable = tables.find((t) => t.id === selectedTableId);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTable) {
      alert('Silakan pilih salah satu meja yang tersedia di denah terlebih dahulu.');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Mohon lengkapi nama dan nomor WhatsApp Anda.');
      return;
    }

    const newRes = StorageService.createReservation({
      tableId: activeTable.id,
      tableNumber: activeTable.number,
      area: activeTable.area,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      guestsCount: guestCount,
      specialRequests: specialRequests.trim() || undefined,
      status: 'confirmed',
    });

    setConfirmedReservation(newRes);
    onReservationCreated(newRes);
  };

  return (
    <section className="space-y-10 pb-16">
      
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sistem Reservasi Meja Real-Time</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">
          Pilih Spot Favorit Anda di Kopi & Ruang
        </h2>
        <p className="text-sm text-stone-400">
          Nikmati suasana indoor ber-AC yang tenang untuk fokus kerja, garden terrace yang asri di sore hari, atau VIP room eksklusif untuk pertemuan penting.
        </p>
      </div>

      {/* Confirmation Success Card if just booked */}
      {confirmedReservation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto p-6 rounded-3xl glass-panel border border-emerald-500/40 bg-emerald-950/20 text-stone-100 shadow-2xl"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-white font-display">
                  Reservasi Meja Berhasil Dikonfirmasi!
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {confirmedReservation.bookingCode}
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-1">
                Terima kasih, <strong>{confirmedReservation.customerName}</strong>. Meja <strong>{confirmedReservation.tableNumber}</strong> ({confirmedReservation.area.toUpperCase()}) telah kami kunci untuk Anda pada <strong>{confirmedReservation.date}</strong> pukul <strong>{confirmedReservation.timeSlot} WIB</strong> ({confirmedReservation.guestsCount} tamu).
              </p>

              <div className="mt-4 flex flex-wrap gap-2.5">
                <button
                  onClick={() => onOpenWhatsAppPreview(confirmedReservation)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Lihat / Kirim Notifikasi WhatsApp</span>
                </button>
                <button
                  onClick={() => setConfirmedReservation(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-semibold"
                >
                  Reservasi Meja Lain
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Reservation Grid: Filters & Interactive Floor Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Date, Time, Area Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-400" />
              <span>Detail Waktu & Tamu</span>
            </h3>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Pilih Tanggal Reservasi
              </label>
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-stone-200"
              />
            </div>

            {/* Guests Count */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                <span>Jumlah Tamu</span>
                <span className="text-stone-300">{guestCount} Orang</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 4, 6, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setGuestCount(num)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      guestCount === num
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                        : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                    }`}
                  >
                    {num} {num === 8 ? '8+' : 'Pax'}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Pilihan Jam Kedatangan (WIB)</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all ${
                      selectedTimeSlot === slot
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                        : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Area Filter Tabs */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Filter Area Ruangan
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'Semua Area' },
                  { id: 'indoor', label: 'Indoor AC Lounge' },
                  { id: 'garden', label: 'Garden Patio (Outdoor)' },
                  { id: 'bar', label: 'Bar Counter' },
                  { id: 'vip', label: 'VIP Private Room' },
                ].map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedArea(a.id as any)}
                    className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                      selectedArea === a.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Selected Table Booking Form */}
          {activeTable && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleBooking}
              className="p-6 rounded-3xl glass-panel border border-amber-500/30 bg-[#16100c] space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                    Meja Terpilih
                  </span>
                  <h4 className="text-lg font-bold text-white font-display">
                    {activeTable.name}
                  </h4>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {activeTable.capacity} Kursi • Tersedia
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-stone-300 block mb-1">Nama Pemesan *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Rian Prasetya"
                    className="w-full px-3 py-2 rounded-xl glass-input"
                  />
                </div>

                <div>
                  <label className="text-stone-300 block mb-1">Nomor WhatsApp * (Kirim Notifikasi Otomatis)</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 rounded-xl glass-input"
                  />
                </div>

                <div>
                  <label className="text-stone-300 block mb-1">Email (Kirim E-Tiket Meja)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="rian@example.com"
                    className="w-full px-3 py-2 rounded-xl glass-input"
                  />
                </div>

                <div>
                  <label className="text-stone-300 block mb-1">Permintaan Khusus (Opsional)</label>
                  <input
                    type="text"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Contoh: Butuh baby chair, dekat colokan, dekor ulang tahun..."
                    className="w-full px-3 py-2 rounded-xl glass-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-2xl glass-button-primary font-bold text-sm flex items-center justify-center gap-2 shadow-lg mt-4"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Kunci Meja Ini & Konfirmasi</span>
              </button>
            </motion.form>
          )}

        </div>

        {/* Right Column: Visual Interactive 2D Floor Plan (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                  Denah Meja Real-Time
                </h3>
                <p className="text-xs text-stone-400">
                  Klik meja hijau untuk memilih tempat duduk yang Anda inginkan.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                  <span className="text-stone-300 text-[11px]">Tersedia</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
                  <span className="text-stone-300 text-[11px]">Dipilih</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/60" />
                  <span className="text-stone-400 text-[11px]">Terisi/Reserved</span>
                </div>
              </div>
            </div>

            {/* Interactive Floor Map Area */}
            <div className="relative aspect-[16/11] w-full rounded-2xl bg-[#0e0a08]/90 border border-white/10 p-4 sm:p-6 overflow-hidden select-none">
              
              {/* Floor Plan Zone Labels */}
              <div className="absolute top-3 left-4 text-[10px] uppercase font-bold tracking-widest text-amber-500/60 flex items-center gap-1">
                <span>❄️ Indoor AC Lounge</span>
              </div>
              <div className="absolute top-3 right-4 text-[10px] uppercase font-bold tracking-widest text-amber-500/60 flex items-center gap-1">
                <span>☕ Barista Bar Counter</span>
              </div>
              <div className="absolute bottom-3 left-4 text-[10px] uppercase font-bold tracking-widest text-emerald-500/60 flex items-center gap-1">
                <span>🌿 Garden Patio (Smoking Area)</span>
              </div>
              <div className="absolute bottom-3 right-4 text-[10px] uppercase font-bold tracking-widest text-purple-400/60 flex items-center gap-1">
                <span>👑 VIP Pod Studio</span>
              </div>

              {/* Visual Divider Lines */}
              <div className="absolute top-0 bottom-0 left-[68%] border-r border-dashed border-white/10" />
              <div className="absolute left-0 right-[32%] top-[56%] border-b border-dashed border-white/10" />

              {/* Cafe Counter Representation */}
              <div className="absolute top-[18%] right-[4%] w-[24%] h-[40%] rounded-xl bg-stone-800/40 border border-amber-500/20 flex flex-col items-center justify-center p-2 text-center pointer-events-none">
                <Coffee className="w-6 h-6 text-amber-400/40 mb-1" />
                <span className="text-[10px] font-bold text-stone-400 tracking-wider">ESPRESSO BAR</span>
                <span className="text-[8px] text-stone-500">Pick-up & Order</span>
              </div>

              {/* Entrance indicator */}
              <div className="absolute top-[50%] left-0 -translate-y-1/2 px-1.5 py-4 rounded-r-lg bg-white/5 border border-white/10 text-[9px] font-bold text-stone-400 [writing-mode:vertical-rl] flex items-center justify-center">
                PINTU MASUK
              </div>

              {/* Render Tables */}
              {filteredTables.map((table) => {
                const isSelected = selectedTableId === table.id;
                const isAvailable = table.status === 'available';

                let bgClasses = 'bg-stone-800/80 border-white/15 text-stone-400 opacity-60 cursor-not-allowed';
                if (isSelected) {
                  bgClasses = 'bg-amber-500 border-amber-300 text-stone-950 font-bold shadow-lg shadow-amber-500/40 scale-110 z-20 ring-4 ring-amber-500/30';
                } else if (isAvailable) {
                  bgClasses = 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200 hover:border-emerald-400 hover:bg-emerald-900/80 hover:scale-105 cursor-pointer shadow-md';
                }

                return (
                  <motion.button
                    key={table.id}
                    type="button"
                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                    onClick={() => {
                      if (isAvailable) {
                        setSelectedTableId(isSelected ? null : table.id);
                      }
                    }}
                    style={{
                      left: `${table.position.x}%`,
                      top: `${table.position.y}%`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl p-2.5 sm:p-3.5 border flex flex-col items-center justify-center transition-all duration-200 ${bgClasses}`}
                  >
                    <span className="text-xs sm:text-sm font-bold font-mono">
                      {table.number}
                    </span>
                    <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] mt-0.5 opacity-90">
                      <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>{table.capacity}</span>
                    </div>
                  </motion.button>
                );
              })}

            </div>

            {/* Table Details Cards Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Informasi Meja di Area {selectedArea.toUpperCase()}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredTables.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => t.status === 'available' && setSelectedTableId(t.id)}
                    className={`p-3 rounded-2xl border transition-all ${
                      selectedTableId === t.id
                        ? 'bg-amber-500/20 border-amber-400'
                        : 'bg-white/5 border-white/5 hover:border-white/10'
                    } ${t.status === 'available' ? 'cursor-pointer' : 'opacity-60'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-white/10 font-mono font-bold text-xs flex items-center justify-center text-amber-300">
                          {t.number}
                        </span>
                        <span className="text-xs font-bold text-white">{t.name}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        t.status === 'available'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {t.status === 'available' ? 'Tersedia' : 'Terisi'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-stone-400">
                      <span>👥 Kapasitas: {t.capacity} Orang</span>
                      {t.hasPowerOutlet && <span>⚡ Ada Colokan</span>}
                      {t.isSmoking && <span>🚬 Smoking</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
};
