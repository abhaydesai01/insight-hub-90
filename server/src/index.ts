import "dotenv/config";
import "./registerModels.js";
import express from "express";
import cors from "cors";
import { connectDb } from "./db.js";
import { seedAdmin } from "./seed.js";
import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/sessions.js";

const PORT = Number(process.env.PORT) || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "";
const JWT_SECRET = process.env.JWT_SECRET || "";

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}
if (!JWT_SECRET || JWT_SECRET.length < 16) {
  console.error("JWT_SECRET must be set to a random string at least 16 characters");
  process.exit(1);
}

const app = express();
app.use(
  cors({
    origin: [/localhost:\d+$/, /^https?:\/\/127\.0\.0\.1:\d+$/],
    credentials: true,
  })
);
app.use(express.json({ limit: "512kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

try {
  await connectDb(MONGODB_URI);
  await seedAdmin();
} catch (err) {
  console.error("API cannot start until MongoDB is reachable. See errors above.");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
