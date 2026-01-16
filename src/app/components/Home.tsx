import { Coins, Settings, Library, Package } from 'lucide-react';

interface HomeProps {
  coins: number;
  onOpenPack: (count: 1 | 5) => void;
  onOpenSettings: () => void;
  onOpenCollection: () => void;
  onOpenTestMode: () => void;
}

export function Home({ coins, onOpenPack, onOpenSettings, onOpenCollection, onOpenTestMode }: HomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Package className="w-8 h-8 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Card Draw Lab</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-gray-900/50 px-4 py-2 rounded-full border border-yellow-500/30">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-bold">{coins}</span>
          </div>
          
          <button
            onClick={onOpenSettings}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Settings className="w-6 h-6 text-gray-300" />
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <div className="text-center mb-12">
          <div className="inline-block p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl mb-6 border border-purple-500/30">
            <Package className="w-24 h-24 text-purple-400" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-3">Open Card Packs</h2>
          <p className="text-gray-400 max-w-md">
            Discover rare and legendary cards with holographic effects
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mb-6">
          <button
            onClick={() => onOpenPack(1)}
            disabled={coins < 100}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-bold py-6 px-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            <div className="text-2xl mb-1">Open 1 Pack</div>
            <div className="text-sm opacity-80 flex items-center justify-center gap-1">
              <Coins className="w-4 h-4" />
              100
            </div>
          </button>
          
          <button
            onClick={() => onOpenPack(5)}
            disabled={coins < 450}
            className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-bold py-6 px-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              SAVE 10%
            </div>
            <div className="text-2xl mb-1">Open 5 Packs</div>
            <div className="text-sm opacity-80 flex items-center justify-center gap-1">
              <Coins className="w-4 h-4" />
              450
            </div>
          </button>
        </div>

        {/* Test Mode Button */}
        <button
          onClick={onOpenTestMode}
          className="px-6 py-3 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/50 text-purple-300 rounded-xl transition-all flex items-center gap-2"
        >
          <span className="text-lg">✨</span>
          <span>Test Mode - Preview Animations</span>
        </button>
      </main>
      
      {/* Footer */}
      <footer className="p-6">
        <button
          onClick={onOpenCollection}
          className="w-full bg-gray-800/50 hover:bg-gray-800 border border-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3"
        >
          <Library className="w-5 h-5" />
          View Collection
        </button>
      </footer>
    </div>
  );
}