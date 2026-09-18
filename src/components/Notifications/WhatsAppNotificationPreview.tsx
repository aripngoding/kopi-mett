import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Copy, Check, MessageSquare, ExternalLink } from 'lucide-react';
import { Order, TableReservation } from '../../types';
import { generateWhatsAppOrderMessage, generateWhatsAppReservationMessage } from '../../services/storageService';

interface WhatsAppNotificationPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  data: Order | TableReservation | null;
}

export const WhatsAppNotificationPreview: React.FC<WhatsAppNotificationPreviewProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!data) return null;

  const [copied, setCopied] = useState<boolean>(false);

  const isOrder = 'orderNumber' in data;
  const { url, rawText } = isOrder
    ? generateWhatsAppOrderMessage(data as Order)
    : generateWhatsAppReservationMessage(data as TableReservation);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    window.open(url, '_blank');
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

          {/* WhatsApp Window Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md rounded-3xl overflow-hidden bg-[#0b141a] border border-white/15 text-stone-100 shadow-2xl z-10 my-8 flex flex-col"
          >
            {/* WhatsApp Header Bar */}
            <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  ☕
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-white">Kopi & Ruang Bot</h4>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <p className="text-[11px] text-emerald-400">Online • Notifikasi Otomatis</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body Mockup */}
            <div className="p-4 bg-[#0c1317] bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px] max-h-[60vh] overflow-y-auto space-y-3">
              
              <div className="text-center">
                <span className="px-3 py-1 rounded-lg bg-[#182229] text-[10px] text-stone-400 shadow-sm border border-white/5">
                  Hari Ini • Pesan Otomatis Terenkripsi End-to-End
                </span>
              </div>

              {/* Chat Bubble Sent from Bot to Customer */}
              <div className="flex justify-start">
                <div className="max-w-[88%] rounded-2xl rounded-tl-none bg-[#202c33] text-stone-200 p-3.5 shadow-lg border border-white/5 text-xs whitespace-pre-line leading-relaxed font-sans select-text">
                  {rawText}
                  <div className="text-[9px] text-stone-400 text-right mt-2 flex items-center justify-end gap-1">
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-emerald-400 font-bold">✓✓</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-[#202c33] border-t border-white/10 flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Pesan</span>
                  </>
                )}
              </button>

              <button
                onClick={handleOpenWhatsApp}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka WhatsApp Asli</span>
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
