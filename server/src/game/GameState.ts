import { Card } from './Card';

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  score: number;

  currentDraw:number;
  next6:boolean;
  bonus:boolean;
}

export interface GameState {
  roomId: string;
  players: Player[];
  deck: Card[];
  currentTurn: number;
  maxDraw: number;
  phase: 'waiting' | 'playing' | 'finished';
  losePlayer:string

  hostId: string;
}
