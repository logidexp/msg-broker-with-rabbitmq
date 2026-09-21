import http from "node:http";
import express from "express";
import { WebSocketServer } from "ws";
import { consumeAlerts } from "./rabbitmq.js";

const app = express();
const port = Number(process.env.PORT) || 3002;
const alerts = [];
const MAX_ALERTS = 100;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/alerts", (_req, res) => {
  res.json(alerts);
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

function rememberAlert(alert) {
  if (!alert?.id || alerts.some((item) => item.id === alert.id)) {
    return false;
  }

  alerts.unshift(alert);
  if (alerts.length > MAX_ALERTS) {
    alerts.length = MAX_ALERTS;
  }

  return true;
}

function broadcastAlert(alert) {
  const payload = JSON.stringify(alert);

  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(payload);
    }
  }
}

consumeAlerts((alert) => {
  if (rememberAlert(alert)) {
    broadcastAlert(alert);
  }
}).catch((err) => {
  console.error("rabbitmq startup failed", err.message);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`consumer server listening on http://0.0.0.0:${port}`);
});
