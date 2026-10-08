import { Router } from "express";
import { Flag } from "../models/flag";

const router = Router();

// GET /api/flags?status=open
router.get("/", async (req, res) => {
  const filter: any = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.entity) filter.entity = req.query.entity;
  const docs = await Flag.find(filter).sort({ reportedDate: -1 }).lean();
  res.json(docs);
});

// ponytail: hand-rolled rate limit for the write endpoint (no dep for this).
// 10 flags / 10 min per IP; Map prunes on write so it can't grow unbounded.
const hits = new Map<string, number[]>();
function flagRateLimit(req: any, res: any, next: any) {
  const now = Date.now();
  const arr = (hits.get(req.ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  if (arr.length >= 10) return res.status(429).json({ error: "Too many reports, try again later" });
  arr.push(now);
  hits.set(req.ip, arr);
  next();
}

// POST /api/flags  — user correction pathway
router.post("/", flagRateLimit, async (req, res) => {
  const { entity, entityId, note, field, reporter } = req.body ?? {};
  if (typeof entity !== "string" || typeof entityId !== "string" || typeof note !== "string")
    return res.status(400).json({ error: "entity, entityId and note are required" });
  if (note.length > 2000 || entityId.length > 200 || (field && field.length > 100) || (reporter && reporter.length > 100))
    return res.status(400).json({ error: "field too long" });
  try {
    const flag = new Flag({ entity, entityId, field, note, reporter, status: "open" });
    await flag.save();
    res.status(201).json(flag);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
