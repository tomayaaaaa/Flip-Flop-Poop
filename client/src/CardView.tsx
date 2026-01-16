import { Card } from './types';

const suitSymbol: Record<string, string> = {
  spade: '♠',
  heart: '♥',
  diamond: '♦',
  club: '♣',
  joker: '🃏'
};

export function CardView({ card }: { card: Card }) {
  const isRed =
    card.suit === '♥' ||
    card.suit === '♦' ||
    card.color === 'red';

  const display =
    card.suit === 'joker'
      ? 'JOKER'
      : `${card.suit}${card.value}`;

  return (
    <div
      style={{
        width: 60,
        height: 80,
        border: '1px solid #333',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        background: 'white',
        color: isRed ? 'red' : 'black',
        fontWeight: 'bold'
      }}
    >
      {display}
    </div>
  );
}
