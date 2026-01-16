import { X, Sparkles } from 'lucide-react';
import { Rarity } from '../../types/card';

interface TestModeProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRarity: (rarity: Rarity) => void;
}

export function TestMode({ isOpen, onClose, onSelectRarity }: TestModeProps) {
  if (!isOpen) return null;

  const rarities: { rarity: Rarity; color: string; bgColor: string }[] = [
    { rarity: 'Common', color: '#9CA3AF', bgColor: '#6B7280' },
    { rarity: 'Uncommon', color: '#10B981', bgColor: '#059669' },
    { rarity: 'Rare', color: '#3B82F6', bgColor: '#2563EB' },
    { rarity: 'Epic', color: '#A855F7', bgColor: '#9333EA' },
    { rarity: 'Legendary', color: '#F59E0B', bgColor: '#D97706' },
    { rarity: 'Mythic', color: '#EF4444', bgColor: '#DC2626' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-700 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Test Mode</h2>
        </div>
        
        <p className="text-gray-400 mb-6 text-sm">
          Select a rarity to see its reveal animation. This mode is free and won't cost any coins.
        </p>
        
        <div className="space-y-3">
          {rarities.map(({ rarity, color, bgColor }) => (
            <button
              key={rarity}
              onClick={() => {
                onSelectRarity(rarity);
                onClose();
              }}
              className="w-full p-4 rounded-xl border-2 transition-all transform hover:scale-105 hover:shadow-lg text-left flex items-center justify-between group"
              style={{
                borderColor: bgColor,
                backgroundColor: `${bgColor}20`
              }}
            >
              <div>
                <div 
                  className="font-bold text-lg"
                  style={{ color: color }}
                >
                  {rarity}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {rarity === 'Common' && 'Simple flash animation'}
                  {rarity === 'Uncommon' && 'Shimmer sweep effect'}
                  {rarity === 'Rare' && 'Ring pulse animation'}
                  {rarity === 'Epic' && 'Rainbow prism flash'}
                  {rarity === 'Legendary' && 'Spotlight + gold particles'}
                  {rarity === 'Mythic' && 'Aurora wave + massive particles'}
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-white">→</div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-purple-900/20 border border-purple-700/30 rounded-lg">
          <div className="text-xs text-purple-300">
            💡 Tip: Use "Equal Rates" in Settings to get all rarities more often during normal pulls!
          </div>
        </div>
      </div>
    </div>
  );
}
