
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

const rooms = {};

wss.on('connection', (socket) => {
  let roomId = null;

  socket.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      console.error("Invalid message received:", message);
      return;
    }

    if (data.type === 'join') {
      roomId = data.room;
      rooms[roomId] = rooms[roomId] || [];
      rooms[roomId].push(socket);
      console.log(`User joined room ${roomId}`);
      return;
    }

    if (roomId && rooms[roomId]) {
      rooms[roomId].forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
  });

  socket.on('close', () => {
    if (roomId && rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter((client) => client !== socket);
    }
  });
});

console.log("✅ WebRTC Signaling Server is running");
