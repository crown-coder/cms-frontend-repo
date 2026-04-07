import api from "./api";
import type { DashboardSummary } from "../types";

export const getDashboardSummary = async () => {
  const res = await api.get<DashboardSummary>("/dashboard/summary");

  return res.data;
};
