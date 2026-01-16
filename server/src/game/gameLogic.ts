import { GameState, Player } from './GameState';
import { Card } from './Card';
import { createDeck } from './deck';

export function createGame(roomId: string): GameState {
  return {
    roomId,
    players: [],
    deck: [],
    currentTurn: 0,
    maxDraw: 3,
    phase: 'waiting',
    hostId: '',
    losePlayer: ''
  };
}

export function startGame(state: GameState) {
  state.deck = createDeck();
  state.phase = 'playing';
  for (let i = 0; i < state.players.length; i++) {
    state.players[i].currentDraw = 1;
    state.players[i].next6 = false;
    state.players[i].bonus = false;
  }
}

export function drawCard(state: GameState, playerId: string) {
  const player = state.players[state.currentTurn];
  if (!player || player.id !== playerId) return;
  if (player.currentDraw > getMaxDrawCount(player)) return;
  const card = state.deck.pop();
  if (!card) return;

  player.hand.push(card);

  if (card.suit === 'joker' && card.color === 'black') {
    endGame(state, player);
  }

  if (card.value === 1 && card.suit === '♠') {
    player.bonus = true;
  }
  player.currentDraw ++;
}

function getMaxDrawCount(player: Player): number {
  return player.next6 ? 6 : 3;
}

export function endTurn(state: GameState) {
  state.players[state.currentTurn].currentDraw = 1;
  if(true == state.players[state.currentTurn].next6){
    state.players[state.currentTurn].next6 = false;
    state.players[state.currentTurn].bonus = false;
  }
  if(true == state.players[state.currentTurn].bonus){
    state.players[state.currentTurn].next6 = true;
  }
  state.currentTurn =
    (state.currentTurn + 1) % state.players.length;
}

function endGame(state: GameState, loser: Player) {
  state.phase = 'finished';
  state.losePlayer = loser.id;
  let tmp_score:number[] = [];
  let cnt_11 = 0;
  let cnt_12 = 0;
  let cnt_13 = 0;
  //配列初期化
  for(let i = 0;i < state.players.length;i++){
    tmp_score[i] = 0;
  }

  for (let i = 0; i < state.players.length; i++) {
    cnt_11 = 0;
    cnt_12 = 0;
    cnt_13 = 0;
    if(state.currentTurn != i){
      for(let j = 0; j < state.players[i].hand.length; j++){
        switch (state.players[i].hand[j].value) {
          //通常カード加点
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
          case 6:
          case 7:
          case 8:
          case 9:
          case 10:
            tmp_score[i] += 1;
            break;
        //絵札カード加点
          case 11:
            tmp_score[i] += 2;
            cnt_11++;
            break;
          case 12:
            tmp_score[i] += 2;
            cnt_12++;
            break;
          case 13:
            tmp_score[i] += 2;
            cnt_13++;
            break;
          case 'joker':
          tmp_score[i] += 3;
          cnt_11++;
          cnt_12++;
          cnt_13++;
          default:
            break;
        }
        //ボーナス加点
        if(4 <= cnt_11){
          tmp_score[i] += 5;
        }
        if(4 <= cnt_12){
          tmp_score[i] += 5;
        }
        if(4 <= cnt_13){
          tmp_score[i] += 5;
        }
      }
    }
  }
  
  for (let i = 0; i < state.players.length; i++) {
    if(state.currentTurn != i){
      loser.score -= tmp_score[i] * 100;
      state.players[i].score += tmp_score[i] * 100;
    }
  }
}

export function startNextGame(state: GameState) {
  if (!state.losePlayer) {
    throw new Error("前ゲームの敗者が不明です");
  }

  // ① 手札リセット
  state.players.forEach(player => {
    player.hand = [];
  });

  // ② 山札リセット & シャッフル
  state.deck = createDeck();

  // ③ 最初のプレイヤーを設定
  const loserIndex = state.players.findIndex(
    p => p.id === state.losePlayer
  );

  if (loserIndex === -1) {
    throw new Error("敗者がプレイヤー一覧に存在しません");
  }

  state.currentTurn = loserIndex;
  state.players[state.currentTurn].currentDraw = 1

  // ④ フェーズを戻す
  state.phase = "playing";
}
