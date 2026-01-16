import { useState } from 'react';
import { ArrowLeft, Filter, Package } from 'lucide-react';
import { Card, Rarity } from '../../types/card';
import { HoloCard } from './HoloCard';
import { CardDetail } from './CardDetail';

interface CollectionProps {
  cards: Card[];
  onBack: () => void;
  onOpenPack: () => void;
}

type SortOption = 'recent' | 'rarity' | 'name';

const rarityOrder: Record<Rarity, number> = {
  Mythic: 6,
  Legendary: 5,
  Epic: 4,
  Rare: 3,
  Uncommon: 2,
  Common: 1,
};

export function Collection({ cards, onBack, onOpenPack }: CollectionProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [filterRarity, setFilterRarity] = useState<Rarity | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showFilters, setShowFilters] = useState(false);

  const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];

  // Filter cards
  let filteredCards = filterRarity === 'all' 
    ? cards 
    : cards.filter(card => card.rarity === filterRarity);

  // Sort cards
  if (sortBy === 'rarity') {
    filteredCards = [...filteredCards].sort((a, b) => 
      rarityOrder[b.rarity] - rarityOrder[a.rarity]
    );
  } else if (sortBy === 'name') {
    filteredCards = [...filteredCards].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }
  // 'recent' keeps the original order (latest first)

  const cardCounts = rarities.reduce((acc, rarity) => {
    acc[rarity] = cards.filter(c => c.rarity === rarity).length;
    return acc;
  }, {} as Record<Rarity, number>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Collection</h1>
            <div className="text-gray-400">({cards.length} cards)</div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4 text-white" />
            <span className="text-white">Filters</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-6 pb-4 border-t border-gray-800">
            <div className="pt-4 space-y-4">
              {/* Rarity Filter */}
              <div>
                <div className="text-sm text-gray-400 mb-2">Filter by Rarity</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterRarity('all')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filterRarity === 'all'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    All ({cards.length})
                  </button>
                  {rarities.map(rarity => (
                    <button
                      key={rarity}
                      onClick={() => setFilterRarity(rarity)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        filterRarity === rarity
                          ? 'text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                      style={{
                        backgroundColor: filterRarity === rarity
                          ? rarity === 'Common' ? '#6B7280'
                          : rarity === 'Uncommon' ? '#059669'
                          : rarity === 'Rare' ? '#2563EB'
                          : rarity === 'Epic' ? '#9333EA'
                          : rarity === 'Legendary' ? '#D97706'
                          : '#DC2626'
                          : undefined
                      }}
                    >
                      {rarity} ({cardCounts[rarity]})
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <div className="text-sm text-gray-400 mb-2">Sort by</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy('recent')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      sortBy === 'recent'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Recent
                  </button>
                  <button
                    onClick={() => setSortBy('rarity')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      sortBy === 'rarity'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Rarity
                  </button>
                  <button
                    onClick={() => setSortBy('name')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      sortBy === 'name'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Name
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="px-6 py-8">
        {filteredCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No cards found</h3>
            <p className="text-gray-500 mb-6">
              {filterRarity === 'all' 
                ? 'Open some packs to start your collection!'
                : `No ${filterRarity} cards in your collection yet.`
              }
            </p>
            <button
              onClick={onOpenPack}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all transform hover:scale-105"
            >
              Open a Pack
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredCards.map((card, index) => (
              <div
                key={`${card.id}-${index}`}
                onClick={() => setSelectedCard(card)}
                className="cursor-pointer transform transition-transform hover:scale-105"
              >
                <HoloCard card={card} size="small" enableTilt={false} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Card Detail Modal */}
      <CardDetail card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  );
}
