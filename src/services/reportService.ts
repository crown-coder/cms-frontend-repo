import api from "./api";

export const generateReport = async (startDate: Date, endDate: Date) => {
  const params = new URLSearchParams({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  const response = await api.get(`/reports/generate?${params}`, {
    responseType: "blob",
  });

  return response.data;
};

export const getReportPreview = async (startDate: Date, endDate: Date) => {
  const params = new URLSearchParams({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  const response = await api.get(`/reports/preview?${params}`);

  return response.data;
};
