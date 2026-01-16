import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { rooms, getOrCreateRoom } from './rooms';
import { startGame, drawCard, endTurn, startNextGame } from './game/gameLogic';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});



io.on('connection', socket => {

  socket.on('joinRoom', ({ roomId, name }) => {
    const room = getOrCreateRoom(roomId);
    socket.join(roomId);
    // すでに参加している場合は無視
    if (room.players.some(p => p.id === socket.id)) return;
    room.players.push({
      id: socket.id,
      name,
      hand: [],
      score: 0,
      currentDraw:1,
      next6:false,
      bonus:false
    });
    // ★ 最初の1人をホストに設定
    if (!room.hostId) {
      room.hostId = socket.id;
    }
    socket.emit('joined', { playerId: socket.id });
    io.to(roomId).emit('roomState', room);
  });


  socket.on('startGame', roomId => {
    const room = rooms.get(roomId);
    if (!room) return;
    // ★ ホスト以外は開始不可
    if (socket.id !== room.hostId) return;
    // ★ 人数チェック（2人以上）
    if (room.players.length < 2) return;
    startGame(room);
    io.to(roomId).emit('roomState', room);
  });

  socket.on('drawCard', roomId => {
    const room = rooms.get(roomId);
    if (!room) return;
    drawCard(room, socket.id);
    io.to(roomId).emit('roomState', room);
  });

  socket.on('endTurn', roomId => {
    const room = rooms.get(roomId);
    if (!room) return;
    endTurn(room);
    io.to(roomId).emit('roomState', room);
  });

  socket.on('startNextGame', (roomId) => {
    const room = rooms.get(roomId);
    if (!room) return;
    startNextGame(room);
    io.to(roomId).emit('roomState', room);
  });
});



httpServer.listen(3001, () => {
  console.log('Server running on port 3001');
});
