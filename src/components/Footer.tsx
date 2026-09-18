import React from 'react';
import { Coffee, MapPin, Clock, Wifi, Phone, Mail, Instagram, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenReservation: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenReservation }) => {
  return (
    <footer className="border-t border-white/10 bg-[#0d0a08] text-stone-300 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-amber-500/20">
                <Coffee className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-display text-white">
                Kopi &amp; Ruang
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Ruang bersantai dan berkreasi di jantung kota. Menyajikan seduhan kopi arabika nusantara grade specialty dan sajian dapur berkualitas tinggi.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Biji Kopi Lokal Bersertifikat</span>
            </div>
          </div>

          {/* Col 2: Location & Hours */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs font-display">
              Lokasi &amp; Jam Buka
            </h4>
            <div className="space-y-2 text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Jl. Suryo No. 42, Senopati, Kebayoran Baru, Jakarta Selatan 12180</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-stone-200 font-medium">Senin - Minggu: 08:00 - 23:00 WIB</p>
                  <p className="text-[11px] text-stone-500">Dapur tutup pukul 22:15 WIB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Customer Amenities & Wi-Fi */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs font-display">
              Fasilitas Pengunjung
            </h4>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Wifi className="w-4 h-4" />
                <span>High-Speed Wi-Fi (150 Mbps)</span>
              </div>
              <p className="text-[11px] text-stone-400">
                SSID: <strong className="text-white font-mono">KopiRuang_Specialty</strong><br />
                Password: <strong className="text-white font-mono">kopisruput2026</strong>
              </p>
            </div>
            <p className="text-[11px] text-stone-400">
              Tersedia colokan di seluruh meja indoor, musholla nyaman, dan area smoking garden.
            </p>
          </div>

          {/* Col 4: Quick Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs font-display">
              Akses Cepat
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={onOpenReservation}
                  className="hover:text-amber-300 transition-colors"
                >
                  Reservasi Meja Online
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-amber-300 transition-colors"
                >
                  Dashboard Staff / Barista
                </button>
              </li>
              <li className="flex items-center gap-1.5 text-stone-400">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Hotline: (021) 728-4920</span>
              </li>
              <li className="flex items-center gap-1.5 text-stone-400">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>halo@kopidanruang.id</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Kopi &amp; Ruang Cafe &amp; Roastery. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-1 text-stone-400">
            <span>Dirancang dengan dedikasi untuk penikmat kopi nusantara</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
