import { Card, Rarity } from '../types/card';

const cardSets = ['Genesis', 'Nebula', 'Horizon', 'Eclipse', 'Infinity'];

const commonNames = [
  'Spark Knight', 'Wind Runner', 'Stone Guardian', 'Frost Sprite', 
  'Flame Wisp', 'Ocean Scout', 'Forest Keeper', 'Sky Watcher',
  'Earth Shaper', 'Thunder Child', 'Mist Walker', 'Sun Caller'
];

const uncommonNames = [
  'Crystal Sage', 'Storm Rider', 'Volcanic Titan', 'Glacier Mage',
  'Shadow Dancer', 'Light Bringer', 'Void Seeker', 'Star Weaver'
];

const rareNames = [
  'Dragon\'s Fury', 'Phoenix Ascendant', 'Leviathan\'s Wake', 'Eternal Sentinel',
  'Celestial Guardian', 'Abyssal Lord', 'Cosmic Wanderer', 'Prismatic Oracle'
];

const epicNames = [
  'Archon of Time', 'Empress of Chaos', 'Sovereign of Storms', 'Keeper of Souls',
  'Dimensional Rift', 'Primordial Essence'
];

const legendaryNames = [
  'Eternal Cosmos', 'Void Dragon Emperor', 'Celestial Phoenix',
  'Genesis Titan', 'Infinity Sovereign'
];

const mythicNames = [
  'The Infinite One', 'Origin of All', 'Primordial God'
];

const descriptions: Record<Rarity, string[]> = {
  Common: [
    'A humble warrior with untapped potential.',
    'Basic elemental energy flows through this card.',
    'Common sight in the realm, yet not to be underestimated.'
  ],
  Uncommon: [
    'Enhanced abilities manifest in unexpected ways.',
    'Wielder of refined elemental powers.',
    'A rare talent among the common folk.'
  ],
  Rare: [
    'Legendary power contained within ancient seals.',
    'Only the worthy can harness this incredible force.',
    'A sight that inspires both awe and fear.'
  ],
  Epic: [
    'Transcendent being from beyond the mortal realm.',
    'Power that can reshape reality itself.',
    'Few have witnessed such magnificence and lived to tell.'
  ],
  Legendary: [
    'The stuff of myths and legends made manifest.',
    'Ultimate power that defies all natural laws.',
    'Its mere presence warps the fabric of existence.'
  ],
  Mythic: [
    'A force beyond comprehension, older than time itself.',
    'The universe trembles at its awakening.',
    'Primordial entity of infinite cosmic power.'
  ]
};

const imagesByRarity: Record<Rarity, string[]> = {
  Common: [
    'https://images.unsplash.com/photo-1635921479440-f7a2c10d2d54?w=400&h=560&fit=crop',
    'https://images.unsplash.com/photo-1533371452382-d45a9da51ad9?w=400&h=560&fit=crop',
    'https://images.unsplash.com/photo-1598177183267-28a7765536de?w=400&h=560&fit=crop',
  ],
  Uncommon: [
    'https://images.unsplash.com/photo-1618018353764-685cb47681d9?w=400&h=560&fit=crop',
    'https://images.unsplash.com/photo-1635921479440-f7a2c10d2d54?w=400&h=560&fit=crop',
    'https://images.unsplash.com/photo-1533371452382-d45a9da51ad9?w=400&h=560&fit=crop',
  ],
  Rare: [
    'https://images.unsplash.com/photo-1681673819379-a183d9acf860?w=400&h=560&fit=crop',
    'https://images.unsplash.com/photo-1618018353764-685cb47681d9?w=400&h=560&fit=crop',
    'https://images.unsplash.com/photo-1760030427721-38c1bac5ac30?w=400&h=560&fit=crop',
  ],
  Epic: [
    'https://images.unsplash.com/photo-1760030427721-38c1bac5ac30?w=400&h=560&fit=crop',
    'https://images.unsplash.com/photo-1681673819379-a183d9acf860?w=400&h=560&fit=crop',
    'https://images.unsplash.com/photo-1533371452382-d45a9da51ad9?w=400&h=560&fit=crop',
  ],
  Legendary: [
    'https://images.unsplash.com/photo-1681673819379-a183d9acf860?w=400&h=560&fit=crop',
    'https://images.unsplash.com/photo-1760030427721-38c1bac5ac30?w=400&h=560&fit=crop',
    'https://images.unsplash.com/photo-1533371452382-d45a9da51ad9?w=400&h=560&fit=crop',
  ],
  Mythic: [
    'https://images.unsplash.com/photo-1681673819379-a183d9acf860?w=400&h=560&fit=crop',
    'https://images.unsplash.com/photo-1760030427721-38c1bac5ac30?w=400&h=560&fit=crop',
    'https://images.unsplash.com/photo-1618018353764-685cb47681d9?w=400&h=560&fit=crop',
  ],
};

function generateCards(): Card[] {
  const cards: Card[] = [];
  let idCounter = 1;

  const generate = (names: string[], rarity: Rarity) => {
    const images = imagesByRarity[rarity];
    names.forEach((name, idx) => {
      const setName = cardSets[idx % cardSets.length];
      const desc = descriptions[rarity][idx % descriptions[rarity].length];
      const image = images[idx % images.length];
      cards.push({
        id: `card-${String(idCounter++).padStart(3, '0')}`,
        name,
        setName,
        rarity,
        image,
        description: desc
      });
    });
  };

  generate(commonNames, 'Common');
  generate(uncommonNames, 'Uncommon');
  generate(rareNames, 'Rare');
  generate(epicNames, 'Epic');
  generate(legendaryNames, 'Legendary');
  generate(mythicNames, 'Mythic');

  return cards;
}

export const allCards = generateCards();

export function getCardsByRarity(rarity: Rarity): Card[] {
  return allCards.filter(card => card.rarity === rarity);
}