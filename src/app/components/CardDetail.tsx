import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../types/card';
import { HoloCard } from './HoloCard';

interface CardDetailProps {
  card: Card | null;
  onClose: () => void;
}

export function CardDetail({ card, onClose }: CardDetailProps) {
  if (!card) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 max-w-2xl w-full"
        >
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="bg-gray-900/95 backdrop-blur-sm rounded-3xl p-8 border border-gray-700">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Card Display */}
              <div className="flex-shrink-0 flex justify-center">
                <HoloCard card={card} size="large" enableTilt={true} />
              </div>

              {/* Card Info */}
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-white mb-2">{card.name}</h2>
                <p className="text-gray-400 mb-4">{card.setName}</p>

                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-1">Rarity</div>
                  <div className="text-xl font-bold" style={{ color: card.rarity === 'Common' ? '#9CA3AF' : card.rarity === 'Uncommon' ? '#10B981' : card.rarity === 'Rare' ? '#3B82F6' : card.rarity === 'Epic' ? '#A855F7' : card.rarity === 'Legendary' ? '#F59E0B' : '#EF4444' }}>
                    {card.rarity}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-2">Description</div>
                  <p className="text-gray-300 leading-relaxed">{card.description}</p>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="text-xs text-gray-500 mb-1">Card ID</div>
                  <div className="text-sm text-gray-400 font-mono">{card.id}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
