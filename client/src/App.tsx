import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { CardView } from './CardView';


type Card = {
  suit: string;
  value: string;
};

type Player = {
  id: string;
  name: string;
  hand: Card[];
  score: number;
};

type RoomState = {
  roomId: string;
  players: Player[];
  hostId: string;
  currentTurn: string;
  phase: 'waiting' | 'playing' | 'finished';
};

const socket: Socket = io('https://ffp-h84o.onrender.com');

function App() {
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');
  const [myId, setMyId] = useState('');
  const [state, setState] = useState<RoomState | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      setMyId(socket.id ?? '');
    });

    socket.on('roomState', (roomState: RoomState) => {
      setState(roomState);
    });

    socket.on('gameStarted', () => {
      alert('🎮 ゲーム開始！');
    });

    return () => {
      socket.off('connect');
      socket.off('roomState');
      socket.off('gameStarted');
    };
  }, []);

  const joinRoom = () => {
    if (!roomId || !name) return;
    socket.emit('joinRoom', { roomId, name });
    setJoined(true);
  };

  const isHost = state && myId === state.hostId;
  const myIndex = state
    ? state.players.findIndex(p => p.id === myId)
    : -1;

  const isMyTurn =
    state &&
    myIndex !== -1 &&
    state.currentTurn === myIndex;

  /* ========== 未参加画面 ========== */
  if (!joined) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0b6623',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
        }}
      >
        <div
          style={{
            background: '#1b8a3b',
            padding: 32,
            borderRadius: 12,
            width: 350,
            textAlign: 'center',
          }}
        >
          <h1 style={{ marginBottom: 16 }}>💩Flip-Flop Poop!</h1>
          <input
            placeholder="合言葉"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{ width: '100%', marginBottom: 8, padding: 8 }}
          />
          <input
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', marginBottom: 16, padding: 8 }}
          />
          <button
            onClick={joinRoom}
            style={{
              width: '100%',
              padding: 10,
              fontSize: 16,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            入室
          </button>
        </div>
      </div>
    );
  }

  if (!state) return <div>読み込み中...</div>;
  
  /* ========== ゲーム画面 ========== */
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0b6623',
        padding: 16,
        color: '#fff',
      }}
    >
      <h1 style={{ textAlign: 'center' }}>
        🏷 ルーム：{state.roomId}
      </h1>

      {state.phase === 'waiting' && (
        <h2 style={{ textAlign: 'center', color: '#ffd700' }}>
          参加者待機中…
        </h2>
      )}

      {state.phase === 'playing' && (
        <>
        <h2
          style={{
            textAlign: 'center',
            color: isMyTurn ? '#ffeb3b' : '#fff',
            fontSize: 28,
          }}
        >
          {isMyTurn ? '👉 あなたのターン！' : '他プレイヤーのターン'}
        </h2>
        
        <div style={{ textAlign: 'center', fontSize: 18, color: '#ffd700', marginTop: 4 }}>
          山札の残り: {state.deck.length} 枚
        </div>
    </>
      )}
      {/* ホストのみゲーム開始 */}
      {state.phase === 'waiting' && isHost && (
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <button
            style={{
              fontSize: 20,
              padding: '12px 24px',
              cursor: 'pointer',
            }}
            onClick={() => socket.emit('startGame', roomId)}
          >
            🎮 ゲーム開始
          </button>
        </div>
      )}

      {/* 自分のターン操作 */}
      {state.phase === 'playing' && isMyTurn && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            margin: '16px 0',
          }}
        >
          <button
            style={{ fontSize: 18, padding: '8px 16px' }}
            onClick={() => socket.emit('drawCard', roomId)}
          >
            🃏 引く
          </button>
          <button
            style={{ fontSize: 18, padding: '8px 16px' }}
            onClick={() => socket.emit('endTurn', roomId)}
          >
            ⏭ ターン終了
          </button>
        </div>
      )}

      {state.phase === 'finished' && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
      flexDirection: 'column',
      color: '#fff',
      fontSize: 32,
      textAlign: 'center',
    }}
  >
    <div style={{ marginBottom: 16 }}>
      💩 Flip-Flop Poop! 💩
    </div>
    <div style={{ fontSize: 20, color: '#ffd700' }}>
      {state.players.find(p => p.id === state.losePlayer)?.name} が💩を引きました
    </div>

    {isHost && (
      <button
        style={{
          marginTop: 16,
          fontSize: 20,
          padding: '12px 24px',
          cursor: 'pointer',
        }}
        onClick={() => socket.emit('startNextGame', roomId)}
      >
        ▶ 次のゲームへ
      </button>
    )}

    {!isHost && (
      <div style={{ marginTop: 16, color: '#ffd700' }}>
        ホストが次のゲームを開始するのを待っています…
      </div>
    )}
  </div>
)}


      {/* プレイヤー一覧 */}
      <div style={{ marginTop: 24 }}>
        {state.players.map((player) => {
          const isCurrent =
            state.players[state.currentTurn]?.id === player.id;

          return (
            <div
              key={player.id}
              style={{
                background: isCurrent ? '#145a32' : '#1b8a3b',
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                {player.name}
                {player.id === myId && '（あなた）'}
                {player.id === state.hostId && ' 👑'}
              </div>

              <div style={{ marginBottom: 8 }}>
                スコア：{player.score}
              </div>

              {/* 手札 */}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  paddingBottom: 4,
                }}
              >
                {player.hand.map((card, index) => (
                  <CardView key={index} card={card} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;

