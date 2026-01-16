export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export interface Card {
  id: string;
  name: string;
  setName: string;
  rarity: Rarity;
  image: string;
  description: string;
}

export interface RarityConfig {
  color: string;
  borderColor: string;
  glowColor: string;
  probability: number;
}

export const rarityConfigs: Record<Rarity, RarityConfig> = {
  Common: {
    color: '#9CA3AF',
    borderColor: '#6B7280',
    glowColor: 'rgba(156, 163, 175, 0.5)',
    probability: 70,
  },
  Uncommon: {
    color: '#10B981',
    borderColor: '#059669',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    probability: 20,
  },
  Rare: {
    color: '#3B82F6',
    borderColor: '#2563EB',
    glowColor: 'rgba(59, 130, 246, 0.7)',
    probability: 8,
  },
  Epic: {
    color: '#A855F7',
    borderColor: '#9333EA',
    glowColor: 'rgba(168, 85, 247, 0.8)',
    probability: 1.8,
  },
  Legendary: {
    color: '#F59E0B',
    borderColor: '#D97706',
    glowColor: 'rgba(245, 158, 11, 0.9)',
    probability: 0.19,
  },
  Mythic: {
    color: '#EF4444',
    borderColor: '#DC2626',
    glowColor: 'rgba(239, 68, 68, 1)',
    probability: 0.01,
  },
};
