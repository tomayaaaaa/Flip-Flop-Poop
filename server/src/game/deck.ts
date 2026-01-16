import { Card } from './Card';

export function createDeck(): Card[] {
  const suits = ['♠','♥','♦','♣'] as const;
  const deck: Card[] = [];

  for (const suit of suits) {
    for (let i = 1; i <= 13; i++) {
      deck.push({ suit, value: i });
    }
  }

  deck.push({ suit: 'joker', value: 'joker', color: 'black' });
  deck.push({ suit: 'joker', value: 'joker', color: 'red' });

  return shuffle(deck);
}

function shuffle(cards: Card[]) {
  return [...cards].sort(() => Math.random() - 0.5);
}
