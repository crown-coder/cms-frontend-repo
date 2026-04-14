import api from "./api";
import type { Payment } from "../types";

type PaymentPayload = {
  amount: number;
  paymentDate?: string;
};

export const recordPayment = async (caseId: number, data: PaymentPayload) => {
  const res = await api.post(`/payments/${caseId}/record`, data);
  return res.data;
};

export const getPayments = async (caseId: number) => {
  const res = await api.get<Payment[]>(`/payments/${caseId}`);
  return res.data;
};
