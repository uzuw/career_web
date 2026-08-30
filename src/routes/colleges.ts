import { Router } from "express";
import { College } from "../models/college";

const router = Router();

// GET /api/colleges?affiliation=TU&district=Lalitpur&program=civil-engineer
router.get("/", async (req, res) => {
  const filter: any = {};
  if (req.query.affiliation) filter.affiliation = req.query.affiliation;
  if (req.query.district) filter.district = req.query.district;
  if (req.query.province) filter.province = req.query.province;
  if (req.query.program) filter.programs = req.query.program;
  const docs = await College.find(filter).sort({ name: 1 }).lean();
  res.json(docs);
});

router.get("/:slug", async (req, res) => {
  const doc = await College.findOne({ slug: req.params.slug }).lean();
  if (!doc) return res.status(404).json({ error: "College not found" });
  res.json(doc);
});

export default router;
