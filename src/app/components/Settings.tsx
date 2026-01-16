import { X, Volume2, VolumeX, Sparkles, SparklesIcon } from 'lucide-react';
import { RarityRates } from '../../utils/gacha';
import { Rarity } from '../../types/card';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (enabled: boolean) => void;
  rarityRates: RarityRates;
  setRarityRates: (rates: RarityRates) => void;
}

export function Settings({
  isOpen,
  onClose,
  soundEnabled,
  setSoundEnabled,
  reduceMotion,
  setReduceMotion,
  rarityRates,
  setRarityRates
}: SettingsProps) {
  if (!isOpen) return null;

  const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];

  const handleRateChange = (rarity: Rarity, value: number) => {
    setRarityRates({
      ...rarityRates,
      [rarity]: value
    });
  };

  const resetRates = () => {
    setRarityRates({
      Common: 70,
      Uncommon: 20,
      Rare: 8,
      Epic: 1.8,
      Legendary: 0.19,
      Mythic: 0.01,
    });
  };

  const setEqualRates = () => {
    const equalRate = 100 / 6;
    setRarityRates({
      Common: equalRate,
      Uncommon: equalRate,
      Rare: equalRate,
      Epic: equalRate,
      Legendary: equalRate,
      Mythic: equalRate,
    });
  };

  const total = Object.values(rarityRates).reduce((sum, val) => sum + val, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
        
        <div className="space-y-8">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-blue-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <div className="text-white font-semibold">Sound</div>
                <div className="text-sm text-gray-400">Enable sound effects</div>
              </div>
            </div>
            
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                soundEnabled ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          
          {/* Reduce Motion Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className={`w-5 h-5 ${reduceMotion ? 'text-gray-400' : 'text-purple-400'}`} />
              <div>
                <div className="text-white font-semibold">Reduce Motion</div>
                <div className="text-sm text-gray-400">Simplify animations</div>
              </div>
            </div>
            
            <button
              onClick={() => setReduceMotion(!reduceMotion)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                reduceMotion ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  reduceMotion ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Rarity Rates */}
          <div className="border-t border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">Rarity Rates</h3>
                <p className="text-sm text-gray-400">Adjust pull probabilities</p>
              </div>
              <div className="text-sm">
                <span className={`font-semibold ${Math.abs(total - 100) > 0.1 ? 'text-red-400' : 'text-green-400'}`}>
                  Total: {total.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-4">
              {rarities.map((rarity) => (
                <div key={rarity}>
                  <div className="flex items-center justify-between mb-2">
                    <span 
                      className="font-semibold"
                      style={{ 
                        color: rarity === 'Common' ? '#9CA3AF'
                          : rarity === 'Uncommon' ? '#10B981'
                          : rarity === 'Rare' ? '#3B82F6'
                          : rarity === 'Epic' ? '#A855F7'
                          : rarity === 'Legendary' ? '#F59E0B'
                          : '#EF4444'
                      }}
                    >
                      {rarity}
                    </span>
                    <span className="text-white text-sm font-mono">
                      {rarityRates[rarity].toFixed(2)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.01"
                    value={rarityRates[rarity]}
                    onChange={(e) => handleRateChange(rarity, parseFloat(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${
                        rarity === 'Common' ? '#6B7280'
                        : rarity === 'Uncommon' ? '#059669'
                        : rarity === 'Rare' ? '#2563EB'
                        : rarity === 'Epic' ? '#9333EA'
                        : rarity === 'Legendary' ? '#D97706'
                        : '#DC2626'
                      } 0%, ${
                        rarity === 'Common' ? '#6B7280'
                        : rarity === 'Uncommon' ? '#059669'
                        : rarity === 'Rare' ? '#2563EB'
                        : rarity === 'Epic' ? '#9333EA'
                        : rarity === 'Legendary' ? '#D97706'
                        : '#DC2626'
                      } ${rarityRates[rarity]}%, #374151 ${rarityRates[rarity]}%, #374151 100%)`
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={resetRates}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
              >
                Reset to Default
              </button>
              <button
                onClick={setEqualRates}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
              >
                Equal Rates
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          Card Draw Lab v1.0
        </div>
      </div>
    </div>
  );
}