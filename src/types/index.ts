export type Role =
  | "super_admin"
  | "enforcement_head"
  | "state_controller"
  | "officer";

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  state?: string | null;
}

export interface DashboardSummary {
  totalCases: number;
  pendingCases: number;
  resolvedCases: number;
  totalPenalty: string;
  totalPaid: string;
  outstandingBalance: number;
  casesByState: {
    state: string;
    total: number;
  }[];
}

export interface Case {
  id: number;
  companyName: string;
  rcNumber: string;
  address: string;
  inspectionDate: string;
  state: string;
  status: "pending" | "resolved";
  totalPenalty: number;
  totalPaid: number;
  createdAt: string;
}

export interface ComplianceSection {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
