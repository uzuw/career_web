import { Router } from "express";
import { Exam } from "../models/exam";

const router = Router();

router.get("/", async (_req, res) => {
  const docs = await Exam.find().sort({ nameEn: 1 }).lean();
  res.json(docs);
});

router.get("/:slug", async (req, res) => {
  const doc = await Exam.findOne({ slug: req.params.slug }).lean();
  if (!doc) return res.status(404).json({ error: "Exam not found" });
  res.json(doc);
});

export default router;
