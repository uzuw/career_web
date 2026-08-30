import { Router } from "express";
import { Roadmap } from "../models/roadmap";

const router = Router();

router.get("/:careerSlug", async (req, res) => {
  const doc = await Roadmap.findOne({ careerSlug: req.params.careerSlug }).lean();
  if (!doc) return res.status(404).json({ error: "Roadmap not found" });
  res.json(doc);
});

export default router;
