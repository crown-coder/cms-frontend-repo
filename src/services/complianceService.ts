import api from "./api";
import type { ComplianceSection } from "../types";

export const getSections = async (): Promise<ComplianceSection[]> => {
  const response = await api.get("/compliance-sections");
  return response.data;
};

export const createSection = async (
  data: Omit<ComplianceSection, "id" | "createdAt" | "updatedAt">,
): Promise<ComplianceSection> => {
  const response = await api.post("/compliance-sections", data);
  return response.data;
};
