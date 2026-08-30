import { Router } from "express";
import { checkEligibility } from "../services/eligibility";

const router = Router();

// POST /api/eligibility  { stream, subjectCombo, gpa, budgetMax, district, province }
// Also accepts GET with query params for quick checks.
router.post("/", async (req, res) => {
  try {
    const result = await checkEligibility(req.body);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/", async (req, res) => {
  const result = await checkEligibility({
    stream: req.query.stream as string | undefined,
    subjectCombo: req.query.subjectCombo as string | undefined,
    gpa: req.query.gpa ? Number(req.query.gpa) : undefined,
    budgetMax: req.query.budgetMax ? Number(req.query.budgetMax) : undefined,
    district: req.query.district as string | undefined,
    province: req.query.province as string | undefined,
  });
  res.json(result);
});

export default router;
