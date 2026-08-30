import { Router } from "express";
import { Roadmap } from "../models/roadmap";

const router = Router();

// GET /api/roadmaps  — list all roadmaps
router.get("/", async (_req, res) => {
  const docs = await Roadmap.find().lean();
  res.json(docs);
});

router.get("/:careerSlug", async (req, res) => {
  const doc = await Roadmap.findOne({ careerSlug: req.params.careerSlug }).lean();
  if (!doc) return res.status(404).json({ error: "Roadmap not found" });
  res.json(doc);
});

export default router;
