import { GameState } from './game/GameState';
import { createGame } from './game/gameLogic';

export const rooms = new Map<string, GameState>();

export function getOrCreateRoom(roomId: string) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, createGame(roomId));
  }
  return rooms.get(roomId)!;
}
