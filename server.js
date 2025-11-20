const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const app = express();

app.use(express.static("."));
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let players = {};

wss.on("connection", ws => {
  const id = Math.random().toString(36).substr(2, 9);
  players[id] = { x: 0, y: 0, z: 0, rotY: 0 };

  ws.send(JSON.stringify({ type: "id", id }));

  ws.on("message", msg => {
    const data = JSON.parse(msg);
    if (data.type === "update") {
      players[id] = data.player;
      broadcast({ type: "players", players });
    }
  });

  ws.on("close", () => {
    delete players[id];
    broadcast({ type: "players", players });
  });
});

function broadcast(obj) {
  const json = JSON.stringify(obj);
  for (let client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(json);
  }
}

server.listen(5000, () => console.log("Server running"));

