// API contract tests against the live backend (default http://localhost:4000).
// Run the backend first: `npm run dev` in the project root. Then `npm run test:api`.
const BASE = process.env.API_BASE || "http://localhost:4000";

async function get(path: string): Promise<{ status: number; body: any }> {
  const res = await fetch(`${BASE}${path}`);
  let body: any = null;
  try { body = await res.json(); } catch {}
  return { status: res.status, body };
}

describe("College Choices Nepal — API contract", () => {
  it("GET /health returns ok", async () => {
    const { status, body } = await get("/health");
    expect(status).toBe(200);
    expect(body.status).toBe("ok");
  });

  it("GET /api/careers returns careers with required fields", async () => {
    const { status, body } = await get("/api/careers");
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    for (const c of body) {
      expect(typeof c.slug).toBe("string");
      expect(typeof c.titleEn).toBe("string");
      expect(typeof c.stream).toBe("string");
      expect(Array.isArray(c.subjectCombo) || typeof c.subjectCombo === "string").toBe(true);
    }
    // detailed fields present on at least the first record
    expect(body[0].abroadVsNepal).toBeDefined();
    expect(body[0].salaryNp).toBeDefined();
  });

  it("GET /api/careers/:slug returns abroadVsNepal + salaryNp", async () => {
    const list = await get("/api/careers");
    const slug = list.body[0].slug;
    const { status, body } = await get(`/api/careers/${slug}`);
    expect(status).toBe(200);
    expect(body.slug).toBe(slug);
    expect(body.abroadVsNepal.nepalCost).toBeDefined();
    expect(body.salaryNp.rangeLow).toBeDefined();
  });

  it("GET /api/colleges returns array with geo + affiliation", async () => {
    const { status, body } = await get("/api/colleges");
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    for (const c of body) {
      expect(typeof c.slug).toBe("string");
      expect(typeof c.affiliation).toBe("string");
      expect(typeof c.lat).toBe("number");
      expect(typeof c.lng).toBe("number");
    }
  });

  it("GET /api/colleges?district filters by district", async () => {
    const all = await get("/api/colleges");
    const district = all.body.find((c: any) => c.district)?.district;
    if (!district) return;
    const { status, body } = await get(`/api/colleges?district=${encodeURIComponent(district)}`);
    expect(status).toBe(200);
    expect(body.every((c: any) => c.district === district)).toBe(true);
  });

  it("GET /api/exams returns exams with forCareer", async () => {
    const { status, body } = await get("/api/exams");
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    for (const e of body) {
      expect(typeof e.slug).toBe("string");
      expect(Array.isArray(e.forCareer)).toBe(true);
    }
  });

  it("GET /api/roadmaps lists roadmaps keyed by careerSlug", async () => {
    const { status, body } = await get("/api/roadmaps");
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    for (const r of body) {
      expect(typeof r.careerSlug).toBe("string");
      expect(Array.isArray(r.steps)).toBe(true);
    }
  });

  it("GET /api/roadmaps/:careerSlug returns steps", async () => {
    const list = await get("/api/roadmaps");
    if (list.body.length === 0) return;
    const slug = list.body[0].careerSlug;
    const { status, body } = await get(`/api/roadmaps/${slug}`);
    expect(status).toBe(200);
    expect(body.careerSlug).toBe(slug);
    expect(body.steps.length).toBeGreaterThan(0);
  });

  it("GET /api/eligibility returns eligibleCareers + colleges with reasons", async () => {
    const { status, body } = await get("/api/eligibility?stream=Science&subjectCombo=%2B2%20Science%20(Math)&gpa=3.4");
    expect(status).toBe(200);
    expect(Array.isArray(body.eligibleCareers)).toBe(true);
    expect(Array.isArray(body.colleges)).toBe(true);
    if (body.eligibleCareers.length > 0) {
      expect(Array.isArray(body.eligibleCareers[0].reasons)).toBe(true);
    }
  });

  it("POST /api/flags accepts a user correction", async () => {
    const res = await fetch(`${BASE}/api/flags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "Career",
        entityId: "mbbs",
        field: "salaryNp",
        note: "test flag from api-test",
        reporter: "api-test",
      }),
    });
    const out = await res.json().catch(() => null);
    expect([200, 201]).toContain(res.status);
    expect(out).not.toBeNull();
  });
});
