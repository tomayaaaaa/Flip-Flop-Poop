export type Suit = '♠' | '♥' | '♦' | '♣' | 'joker';

export interface Card {
  suit: Suit;
  value: number | 'joker';
  color?: 'black' | 'red';
}
