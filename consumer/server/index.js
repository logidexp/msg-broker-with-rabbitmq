import express from "express";

const app = express();
const port = Number(process.env.PORT) || 3002;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`consumer server listening on http://0.0.0.0:${port}`);
});
