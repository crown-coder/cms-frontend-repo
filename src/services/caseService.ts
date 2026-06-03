import api from "./api";

/* =========================
   GET ALL CASES
========================= */
export const getCases = async () => {
  const res = await api.get("/cases");
  return res.data;
};

/* =========================
   GET SINGLE CASE
========================= */
export const getCaseById = async (id: number) => {
  const res = await api.get(`/cases/${id}`);
  return res.data;
};

/* =========================
   CREATE CASE
========================= */
export const createCase = async (data: any) => {
  const res = await api.post("/cases", data);
  return res.data;
};

export type ResolvePayload = {
  resolutionType: "payment_complete" | "penalty_waived" | "suspended";
  remark?: string;
  penaltyReduction?: number;
  suspensionReason?: string;
  suspendedUntil?: string;
};

/* =========================
   RESOLVE CASE
========================= */
export const resolveCase = async (id: number, payload: ResolvePayload) => {
  const res = await api.patch(`/cases/${id}/resolve`, payload);

  return res.data;
};

/* =========================
   ADD COMPLIANCE ITEM
========================= */
export const addComplianceItem = async (caseId: number, data: any) => {
  const res = await api.post(`/compliance/${caseId}`, data);

  return res.data;
};

/* =========================
   GET COMPLIANCE SECTIONS
========================= */
export const getComplianceSections = async () => {
  const res = await api.get("/compliance-sections");
  return res.data;
};
