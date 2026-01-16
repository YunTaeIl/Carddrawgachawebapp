import { Card, Rarity, rarityConfigs } from '../types/card';
import { allCards, getCardsByRarity } from '../data/cardData';

export interface RarityRates {
  Common: number;
  Uncommon: number;
  Rare: number;
  Epic: number;
  Legendary: number;
  Mythic: number;
}

export const defaultRates: RarityRates = {
  Common: 70,
  Uncommon: 20,
  Rare: 8,
  Epic: 1.8,
  Legendary: 0.19,
  Mythic: 0.01,
};

export function drawCard(rates: RarityRates = defaultRates): Card {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  const rarities: Rarity[] = ['Mythic', 'Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'];
  
  for (const rarity of rarities) {
    cumulative += rates[rarity];
    if (random <= cumulative) {
      const cardsOfRarity = getCardsByRarity(rarity);
      return cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
    }
  }
  
  // Fallback
  const commonCards = getCardsByRarity('Common');
  return commonCards[Math.floor(Math.random() * commonCards.length)];
}

export function drawMultipleCards(count: number, rates: RarityRates = defaultRates): Card[] {
  return Array.from({ length: count }, () => drawCard(rates));
}

export function drawSpecificRarity(rarity: Rarity): Card {
  const cardsOfRarity = getCardsByRarity(rarity);
  return cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
}