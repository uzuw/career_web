import { Router } from "express";
import { College } from "../models/college";

const router = Router();

// GET /api/colleges?affiliation=TU&district=Lalitpur&program=civil-engineer&limit=12&page=2
router.get("/", async (req, res) => {
  const filter: any = {};
  if (req.query.affiliation) filter.affiliation = req.query.affiliation;
  if (req.query.district) filter.district = req.query.district;
  if (req.query.province) filter.province = req.query.province;
  if (req.query.program) filter.programs = req.query.program;
  // ponytail: optional paging so list pages stop dumping the whole corpus;
  // omitted limit = all (existing clients/tests unaffected).
  const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 0, 0), 50);
  const page = Math.max(parseInt(req.query.page as string) || 1, 1);
  const total = await College.countDocuments(filter);
  res.set("X-Total-Count", String(total));
  let q = College.find(filter).sort({ name: 1 }).lean();
  if (limit > 0) q = q.skip((page - 1) * limit).limit(limit);
  res.json(await q);
});

router.get("/:slug", async (req, res) => {
  const doc = await College.findOne({ slug: req.params.slug }).lean();
  if (!doc) return res.status(404).json({ error: "College not found" });
  res.json(doc);
});

export default router;
