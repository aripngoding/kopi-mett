import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Filter, Tag, ArrowRight, Flame, Leaf, Coffee } from 'lucide-react';
import { MenuItem, MenuCategory } from '../../types';
import { MenuItemCard } from './MenuItemCard';

interface MenuSectionProps {
  menuItems: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
  onOpenReservation: () => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  menuItems,
  onSelectItem,
  onOpenReservation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'popular' | 'vegetarian' | 'new'>('all');

  const categories = [
    { id: 'all', label: 'Semua Menu', count: menuItems.length },
    { id: 'signature', label: 'Signature Kopi', count: menuItems.filter(i => i.category === 'signature').length },
    { id: 'coffee', label: 'Manual & Espresso', count: menuItems.filter(i => i.category === 'coffee').length },
    { id: 'non_coffee', label: 'Non-Coffee & Tea', count: menuItems.filter(i => i.category === 'non_coffee').length },
    { id: 'pastry', label: 'Artisan Pastry', count: menuItems.filter(i => i.category === 'pastry').length },
    { id: 'main_course', label: 'Makanan Utama', count: menuItems.filter(i => i.category === 'main_course').length },
    { id: 'snacks', label: 'Camilan & Sides', count: menuItems.filter(i => i.category === 'snacks').length },
  ];

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category match
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Quick filter
      if (quickFilter === 'popular' && !item.popular) return false;
      if (quickFilter === 'vegetarian' && !item.vegetarian) return false;
      if (quickFilter === 'new' && !item.isNew) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        return matchName || matchDesc;
      }
      return true;
    });
  }, [menuItems, selectedCategory, quickFilter, searchQuery]);

  return (
    <section className="space-y-8 pb-16">
      
      {/* Hero Welcome Card */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 p-6 sm:p-10 bg-gradient-to-r from-amber-950/40 via-stone-900/60 to-amber-900/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Specialty Coffee Roasters & Artisanal Kitchen</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-display leading-[1.15] mb-4">
            Nikmati Kopi Terbaik & <br />
            <span className="text-amber-400">Ruang Hangat</span> Untuk Berkarya
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-6">
            Pesan langsung dari meja Anda atau bawa pulang tanpa antri. Diseduh dari biji kopi single origin pilihan nusantara, disajikan dengan pastry segar harian.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                const menuElem = document.getElementById('catalog-start');
                menuElem?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-2xl glass-button-primary font-bold text-sm flex items-center gap-2"
            >
              <Coffee className="w-4 h-4" />
              <span>Jelajahi Menu</span>
            </button>

            <button
              onClick={onOpenReservation}
              className="px-6 py-3 rounded-2xl glass-button-secondary font-semibold text-sm flex items-center gap-2"
            >
              <span>Reservasi Meja</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          {/* Promo code badge banner */}
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Tag className="w-4 h-4" />
            </div>
            <p className="text-xs text-stone-300">
              Gunakan kode promo <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">KOPIBARU</span> untuk diskon 15% di checkout!
            </p>
          </div>
        </div>
      </div>

      {/* Search & Categories Bar */}
      <div id="catalog-start" className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kopi, matcha, croissant, pasta..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-sm text-white placeholder-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'popular', label: 'Favorit 🔥' },
              { id: 'new', label: 'Menu Baru ✨' },
              { id: 'vegetarian', label: 'Vegetarian 🌿' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setQuickFilter(f.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  quickFilter === f.id
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                    : 'bg-white/5 border border-white/10 text-stone-300 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories scrollable pill list */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as MenuCategory)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium whitespace-nowrap border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-lg shadow-amber-950/50 font-bold'
                  : 'bg-stone-900/40 border-white/8 text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-white/10 text-stone-400'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onSelect={onSelectItem}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl glass-card border border-white/10">
          <Coffee className="w-12 h-12 text-stone-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-200 mb-1">Menu Tidak Ditemukan</h3>
          <p className="text-sm text-stone-400 max-w-sm mx-auto mb-4">
            Tidak ada sajian yang sesuai dengan kata kunci "{searchQuery}". Coba kata kunci lain atau reset filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setQuickFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-white/10 text-stone-200 hover:bg-white/15 text-xs font-semibold"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

    </section>
  );
};
