import { Card } from './Card';

export interface Player {
  id: string;     //ID
  name: string;   //名前
  hand: Card[];   //手札
  score: number;  //点数

  currentDraw:number; //当該ターンのドロー枚数
  useSkip:boolean;//スキップを利用したか
  bonus:boolean;  //次ターンボーナスフラグ
  next6:boolean;  //ターンエンド時bonusがtrueならtrueになる(このターンでボーナスが有効になることを表す)
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
  isBonusActive: boolean; // ♠1有効中

  isSkipActive: boolean;  // skip権有効化
  skipholder: string; // skip権保持者
}
