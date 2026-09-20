import express from "express";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`broker server listening on http://localhost:${port}`);
});
