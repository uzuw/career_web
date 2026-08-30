import { Router } from "express";
import { Scholarship } from "../models/scholarship";

const router = Router();

router.get("/", async (_req, res) => {
  const docs = await Scholarship.find().sort({ name: 1 }).lean();
  res.json(docs);
});

router.get("/:slug", async (req, res) => {
  const doc = await Scholarship.findOne({ slug: req.params.slug }).lean();
  if (!doc) return res.status(404).json({ error: "Scholarship not found" });
  res.json(doc);
});

export default router;
