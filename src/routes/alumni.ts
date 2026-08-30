import { Router } from "express";
import { Alumni } from "../models/alumni";

const router = Router();

// GET /api/alumni?careerSlug=&collegeSlug=  — list, newest first
router.get("/", async (req, res) => {
  const filter: any = {};
  if (req.query.careerSlug) filter.careerSlug = req.query.careerSlug;
  if (req.query.collegeSlug) filter.collegeSlug = req.query.collegeSlug;
  const docs = await Alumni.find(filter).sort({ verifiedDate: -1 }).lean();
  res.json(docs);
});

// GET /api/alumni/random?careerSlug=&collegeSlug= — one random experience
router.get("/random", async (req, res) => {
  const filter: any = {};
  if (req.query.careerSlug) filter.careerSlug = req.query.careerSlug;
  if (req.query.collegeSlug) filter.collegeSlug = req.query.collegeSlug;
  const [doc] = await Alumni.aggregate([{ $match: filter }, { $sample: { size: 1 } }]);
  if (!doc) return res.status(404).json({ error: "no experience found" });
  res.json(doc);
});

export default router;
