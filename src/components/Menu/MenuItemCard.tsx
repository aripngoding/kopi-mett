import React from 'react';
import { motion } from 'motion/react';
import { Plus, Star, Sparkles, Clock, Leaf } from 'lucide-react';
import { MenuItem } from '../../types';
import { formatIDR } from '../../services/storageService';

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onSelect }) => {
  const isCustomizable = 
    item.availableCustomizations?.ice || 
    item.availableCustomizations?.sugar || 
    item.availableCustomizations?.milk || 
    item.availableCustomizations?.extraShot || 
    item.availableCustomizations?.spiceLevel;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`group relative rounded-3xl overflow-hidden glass-card flex flex-col justify-between ${
        !item.inStock ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={() => item.inStock && onSelect(item)}
    >
      {/* Top Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-900/60">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        
        {/* Soft dark gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#140e0b] via-transparent to-black/20" />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {item.popular && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-stone-950 flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3 fill-stone-950" />
              Favorit
            </span>
          )}
          {item.isNew && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-stone-950 shadow-md">
              Baru
            </span>
          )}
          {item.vegetarian && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
              <Leaf className="w-3 h-3" /> Veg
            </span>
          )}
        </div>

        {/* Prep Time Tag */}
        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-medium text-stone-300 flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{item.prepTimeMinutes}m</span>
        </div>
      </div>

      {/* Item Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-amber-300 transition-colors font-display line-clamp-1">
              {item.name}
            </h3>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{item.rating}</span>
            </div>
          </div>

          <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed mb-4">
            {item.description}
          </p>
        </div>

        {/* Footer: Price & Add button */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
          <div>
            <span className="text-xs text-stone-400 block font-medium">Harga</span>
            <span className="text-base sm:text-lg font-bold text-amber-400 font-display">
              {formatIDR(item.price)}
            </span>
          </div>

          {item.inStock ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-stone-950 font-semibold text-xs transition-all duration-200 group-hover:bg-amber-500 group-hover:text-stone-950 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isCustomizable ? 'Kustom' : 'Pesan'}</span>
            </button>
          ) : (
            <span className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              Habis
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
