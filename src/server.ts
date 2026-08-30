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

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/careers", careersRouter);
app.use("/api/colleges", collegesRouter);
app.use("/api/exams", examsRouter);
app.use("/api/scholarships", scholarshipsRouter);
app.use("/api/roadmaps", roadmapsRouter);
app.use("/api/eligibility", eligibilityRouter);
app.use("/api/flags", flagsRouter);

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
