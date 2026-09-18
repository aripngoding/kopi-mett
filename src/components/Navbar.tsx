import React from 'react';
import { Coffee, Calendar, ShoppingBag, LayoutDashboard, Search, Bell, Clock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { CartItem } from '../types';
import { formatIDR } from '../services/storageService';

interface NavbarProps {
  activeTab: 'menu' | 'reservation' | 'tracker' | 'dashboard';
  setActiveTab: (tab: 'menu' | 'reservation' | 'tracker' | 'dashboard') => void;
  cart: CartItem[];
  onOpenCart: () => void;
  onOpenTracker: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cart,
  onOpenCart,
  onOpenTracker,
}) => {
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.itemTotal, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#120e0b]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('menu')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/40 border border-amber-400/30 group-hover:scale-105 transition-transform duration-300">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-display">
                  Kopi & Ruang
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Roastery
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden xs:inline">Buka Sekarang • Senopati, Jaksel</span>
                <span className="xs:hidden">Buka • 08-23 WIB</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-2xl bg-white/[0.04] border border-white/8 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'menu'
                  ? 'bg-amber-500 text-stone-950 font-semibold shadow-md shadow-amber-500/25'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span>Menu & Pesan</span>
            </button>

            <button
              onClick={() => setActiveTab('reservation')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'reservation'
                  ? 'bg-amber-500 text-stone-950 font-semibold shadow-md shadow-amber-500/25'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Reservasi Meja</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('tracker');
                onOpenTracker();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'tracker'
                  ? 'bg-amber-500 text-stone-950 font-semibold shadow-md shadow-amber-500/25'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Lacak Pesanan</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-stone-950 font-semibold shadow-md shadow-amber-500/25'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Admin</span>
            </button>
          </nav>

          {/* Right Action: Cart & Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Quick Track order for mobile */}
            <button
              onClick={onOpenTracker}
              title="Lacak Status Pesanan Anda"
              className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-stone-300 hover:text-amber-400 hover:bg-white/10 transition-colors relative"
            >
              <Clock className="w-5 h-5" />
              <span className="sr-only">Lacak Pesanan</span>
            </button>

            {/* Shopping Cart Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onOpenCart}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-semibold hover:from-amber-400 hover:to-amber-500 transition-all duration-200 shadow-lg shadow-amber-500/20 border border-amber-300/30"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-stone-900 text-amber-400 text-xs font-bold flex items-center justify-center border border-amber-500/40">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-medium text-sm">
                {totalCartCount > 0 ? formatIDR(cartSubtotal) : 'Keranjang'}
              </span>
            </motion.button>
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-white/5 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'menu' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-300'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            Menu
          </button>
          <button
            onClick={() => setActiveTab('reservation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'reservation' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-300'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Reservasi
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'tracker' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Lacak
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-300'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Admin
          </button>
        </div>

      </div>
    </header>
  );
};
