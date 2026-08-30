import { Router } from "express";
import { Career } from "../models/career";

const router = Router();

// GET /api/careers?stream=Science&subjectCombo=Sci+Math&minGpa=2.0
router.get("/", async (req, res) => {
  const filter: any = {};
  if (req.query.stream) filter.stream = req.query.stream;
  if (req.query.subjectCombo) filter.subjectCombo = req.query.subjectCombo;
  const docs = await Career.find(filter).sort({ titleEn: 1 }).lean();
  res.json(docs);
});

// GET /api/careers/:slug
router.get("/:slug", async (req, res) => {
  const doc = await Career.findOne({ slug: req.params.slug }).lean();
  if (!doc) return res.status(404).json({ error: "Career not found" });
  res.json(doc);
});

export default router;
