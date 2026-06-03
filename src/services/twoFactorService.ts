import api from "./api";

export const setupTwoFactor = async () => {
  const res = await api.post("/2fa/setup");
  return res.data;
};

export const verifyTwoFactor = async (otp: string) => {
  const res = await api.post("/2fa/verify", { otp });
  return res.data;
};

export const loginTwoFactor = async (payload: {
  token: string;
  otp?: string;
  recoveryCode?: string;
  rememberDevice?: boolean;
}) => {
  const res = await api.post("/2fa/login", payload);
  return res.data;
};

export const disableTwoFactor = async (payload: {
  password: string;
  otp?: string;
  recoveryCode?: string;
}) => {
  const res = await api.post("/2fa/disable", payload);
  return res.data;
};

export const resetTwoFactor = async (payload: {
  password: string;
  recoveryCode: string;
}) => {
  const res = await api.post("/2fa/reset", payload);
  return res.data;
};
