import { randomUUID } from "node:crypto";
import express from "express";
import { CHANNELS, connectRabbit, publishAlert } from "./rabbitmq.js";

const app = express();
const port = Number(process.env.PORT) || 3001;
const allowedChannels = new Set(CHANNELS);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/alerts", async (req, res) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  const detail = typeof req.body?.detail === "string" ? req.body.detail.trim() : "";
  const channel =
    typeof req.body?.channel === "string" ? req.body.channel.trim() : "";

  if (!title || !detail) {
    res.status(400).json({ error: "title and detail are required" });
    return;
  }

  if (!allowedChannels.has(channel)) {
    res.status(400).json({ error: "channel must be channel-1 or channel-2" });
    return;
  }

  const alert = {
    id: randomUUID(),
    channel,
    title,
    detail,
    sentAt: new Date().toISOString(),
  };

  try {
    await publishAlert(alert);
    res.status(201).json(alert);
  } catch (err) {
    res.status(503).json({ error: err.message || "failed to publish alert" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`broker server listening on http://0.0.0.0:${port}`);
});

connectRabbit().catch((err) => {
  console.error("rabbitmq startup failed", err.message);
});
