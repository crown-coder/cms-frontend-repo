import axios from "axios";

const API = "http://localhost:4000/api";
const CASES_API = `${API}/cases`;
const COMPLIANCE_API = `${API}/compliance`;
const SECTIONS_API = `${API}/compliance-sections`;

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

/* =========================
   GET ALL CASES
========================= */
export const getCases = async () => {
  const res = await axios.get(CASES_API, getAuthHeader());
  return res.data;
};

/* =========================
   GET SINGLE CASE
========================= */
export const getCaseById = async (id: number) => {
  const res = await axios.get(`${CASES_API}/${id}`, getAuthHeader());
  return res.data;
};

/* =========================
   CREATE CASE
========================= */
export const createCase = async (data: any) => {
  const res = await axios.post(CASES_API, data, getAuthHeader());
  return res.data;
};

/* =========================
   RESOLVE CASE
========================= */
export const resolveCase = async (id: number, remark: string) => {
  const res = await axios.patch(
    `${CASES_API}/${id}/resolve`,
    { remark },
    getAuthHeader(),
  );

  return res.data;
};

/* =========================
   ADD COMPLIANCE ITEM
========================= */
export const addComplianceItem = async (caseId: number, data: any) => {
  const res = await axios.post(
    `${COMPLIANCE_API}/${caseId}`,
    data,
    getAuthHeader(),
  );

  return res.data;
};

/* =========================
   GET COMPLIANCE SECTIONS
========================= */
export const getComplianceSections = async () => {
  const res = await axios.get(SECTIONS_API, getAuthHeader());
  return res.data;
};
