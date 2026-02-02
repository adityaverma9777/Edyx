import express from "express";
import cors from "cors";
import { supabase } from "./lib/supabase";
import authRoutes from "./routes/auth";
import apiKeyRoutes from "./routes/apikeys";
import chatRoutes from "./routes/chat";

const app = express();

app.use(cors());
app.use(express.json());
app.get("/", (_req, res) => {
  res.json({ status: "Edyx backend running" });
});
app.use("/auth", authRoutes);
app.use("/keys", apiKeyRoutes);
app.use("/chat", chatRoutes);

app.get("/health/db", async (_req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .limit(1);

  if (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }

  res.json({ ok: true, db: "connected" });
});

// check table exist
app.get("/health/api-keys", async (_req, res) => {
  const { data, error } = await supabase
    .from("api_keys")
    .select("id")
    .limit(1);

  if (error) {
    return res.status(500).json({
      ok: false,
      table: "api_keys",
      error: error.message,
      code: error.code,
      hint: error.hint,
      details: error.details
    });
  }

  res.json({ ok: true, table: "api_keys", exists: true, row_count: data?.length || 0 });
});

app.post("/test", (req, res) => {
  res.json({
    message: "Backend is working",
    you_sent: req.body,
  });
});

export default app;
