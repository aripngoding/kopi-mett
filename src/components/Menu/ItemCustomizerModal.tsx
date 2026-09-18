import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Flame, Sparkles, Check } from 'lucide-react';
import { MenuItem, CartItemCustomization, IceLevel, SugarLevel, MilkOption, SpiceLevel } from '../../types';
import { formatIDR } from '../../services/storageService';

interface ItemCustomizerModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (customization: CartItemCustomization, quantity: number, itemTotal: number) => void;
}

export const ItemCustomizerModal: React.FC<ItemCustomizerModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!item) return null;

  const [quantity, setQuantity] = useState<number>(1);
  const [ice, setIce] = useState<IceLevel>('normal');
  const [sugar, setSugar] = useState<SugarLevel>('100%');
  const [milk, setMilk] = useState<MilkOption>('fresh_milk');
  const [extraShot, setExtraShot] = useState<boolean>(false);
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>('sedang');
  const [notes, setNotes] = useState<string>('');

  // Calculate dynamic price with extras
  let basePrice = item.price;
  let extras = 0;
  if (extraShot) extras += 6000;
  if (milk === 'oat_milk' || milk === 'almond_milk') extras += 8000;

  const singleItemPrice = basePrice + extras;
  const totalItemPrice = singleItemPrice * quantity;

  const handleConfirm = () => {
    const custom: CartItemCustomization = {
      ...(item.availableCustomizations?.ice ? { ice } : {}),
      ...(item.availableCustomizations?.sugar ? { sugar } : {}),
      ...(item.availableCustomizations?.milk ? { milk } : {}),
      ...(item.availableCustomizations?.extraShot ? { extraShot } : {}),
      ...(item.availableCustomizations?.spiceLevel ? { spiceLevel } : {}),
      notes: notes.trim() || undefined,
    };
    onAddToCart(custom, quantity, totalItemPrice);
    onClose();
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
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-3xl overflow-hidden glass-panel border border-white/15 text-stone-100 shadow-2xl z-10 my-8 max-h-[90vh] flex flex-col"
          >
            {/* Header image banner */}
            <div className="relative h-44 sm:h-52 w-full overflow-hidden flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18120e] via-[#18120e]/40 to-transparent" />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-stone-300 hover:text-white backdrop-blur-md border border-white/10 hover:bg-black/80 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-2 mb-1">
                  {item.popular && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-stone-950 flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3" /> Favorit
                    </span>
                  )}
                  <span className="text-xs text-stone-300 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                    Est. {item.prepTimeMinutes} Menit
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white drop-shadow">
                  {item.name}
                </h3>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <p className="text-sm text-stone-300 leading-relaxed">
                {item.description}
              </p>

              {/* Customization: ICE */}
              {item.availableCustomizations?.ice && (
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Tingkat Es (Ice Level)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'normal', label: 'Normal Ice' },
                      { id: 'less', label: 'Less Ice' },
                      { id: 'none', label: 'No Ice' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setIce(opt.id as IceLevel)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                          ice === opt.id
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold'
                            : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customization: SUGAR */}
              {item.availableCustomizations?.sugar && (
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Tingkat Gula (Sugar Level)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: '100%', label: '100%' },
                      { id: '70%', label: '70%' },
                      { id: '50%', label: '50%' },
                      { id: '0%', label: '0%' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSugar(opt.id as SugarLevel)}
                        className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                          sugar === opt.id
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold'
                            : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customization: MILK */}
              {item.availableCustomizations?.milk && (
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Pilihan Susu
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'fresh_milk', label: 'Fresh Milk', extra: '+Rp 0' },
                      { id: 'oat_milk', label: 'Oat Milk', extra: '+Rp 8k' },
                      { id: 'almond_milk', label: 'Almond Milk', extra: '+Rp 8k' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMilk(opt.id as MilkOption)}
                        className={`p-2 rounded-xl text-xs border text-left flex flex-col justify-between transition-all ${
                          milk === opt.id
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                        }`}
                      >
                        <span className="font-semibold">{opt.label}</span>
                        <span className="text-[10px] text-stone-400 mt-1">{opt.extra}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Extra Shot Espresso */}
              {item.availableCustomizations?.extraShot && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-sm font-semibold text-white">Extra Shot Espresso</p>
                    <p className="text-xs text-stone-400">+Rp 6.000 (Rasa kopi lebih mantap)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExtraShot(!extraShot)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                      extraShot
                        ? 'bg-amber-500 border-amber-400 text-stone-950'
                        : 'border-white/20 bg-black/20'
                    }`}
                  >
                    {extraShot && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                </div>
              )}

              {/* Spice Level */}
              {item.availableCustomizations?.spiceLevel && (
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Tingkat Kepedasan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'tidak_pedas', label: 'Tidak Pedas' },
                      { id: 'sedang', label: 'Sedang' },
                      { id: 'pedas', label: 'Pedas Mantap' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSpiceLevel(opt.id as SpiceLevel)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                          spiceLevel === opt.id
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold'
                            : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Notes */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                  Catatan Khusus untuk Barista/Dapur
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Pisahkan es di cup terpisah, jangan terlalu panas..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-6 border-t border-white/10 bg-[#120e0b]/90 backdrop-blur-md flex items-center justify-between gap-4 flex-shrink-0">
              {/* Quantity Stepper */}
              <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors disabled:opacity-40"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-bold text-base text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                className="flex-1 py-3 px-6 rounded-2xl glass-button-primary font-bold text-sm sm:text-base flex items-center justify-between shadow-xl"
              >
                <span>Tambahkan</span>
                <span>{formatIDR(totalItemPrice)}</span>
              </motion.button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
