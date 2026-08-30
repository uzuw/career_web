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

// POST /api/flags  — user correction pathway
router.post("/", async (req, res) => {
  try {
    const flag = new Flag({
      entity: req.body.entity,
      entityId: req.body.entityId,
      field: req.body.field,
      note: req.body.note,
      reporter: req.body.reporter,
      status: "open",
    });
    await flag.save();
    res.status(201).json(flag);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
