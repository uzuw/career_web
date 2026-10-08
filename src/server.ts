import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { connectDB } from "./db/connect";
import careersRouter from "./routes/careers";
import collegesRouter from "./routes/colleges";
import examsRouter from "./routes/exams";
import scholarshipsRouter from "./routes/scholarships";
import roadmapsRouter from "./routes/roadmaps";
import flagsRouter from "./routes/flags";
import eligibilityRouter from "./routes/eligibility";
import alumniRouter from "./routes/alumni";

const app = express();
// ponytail: open CORS in dev; set FRONTEND_URL (comma-separated) in prod.
app.use(cors({ origin: process.env.FRONTEND_URL?.split(",") || true }));
app.use(express.json({ limit: "100kb" }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/careers", careersRouter);
app.use("/api/colleges", collegesRouter);
app.use("/api/exams", examsRouter);
app.use("/api/scholarships", scholarshipsRouter);
app.use("/api/roadmaps", roadmapsRouter);
app.use("/api/eligibility", eligibilityRouter);
app.use("/api/alumni", alumniRouter);
app.use("/api/flags", flagsRouter);

// ponytail: JSON errors, not Express HTML pages (no stack leaks).
app.use((_req, res) => res.status(404).json({ error: "Not found" }));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`College Choices Nepal API listening on :${env.port}`);
  });
}

start().catch((e) => {
  console.error("Failed to start server:", e);
  process.exit(1);
});
