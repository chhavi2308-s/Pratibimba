import api from "./api";

// =========================
// Reports
// =========================

export const getReports = async () => {
  const res = await api.get("/reports");
  return res.data.data;
};

export const getReportById = async (id: string) => {
  const res = await api.get(`/reports/${id}`);
  return res.data.data;
};

export const createReport = async (data: any) => {
  const res = await api.post("/reports", data);
  return res.data.data;
};

// =========================
// Future Features
// =========================

export const sendReportEmail = async (id: string) => {
  // Future backend endpoint
  // return await api.post(`/reports/${id}/send-email`);

  console.log("Send Report Email:", id);

  return {
    success: true,
    message: "Email functionality not connected yet.",
  };
};

export const downloadReportPDF = async (id: string) => {
  // Future backend endpoint
  // return await api.get(`/reports/${id}/pdf`, {
  //   responseType: "blob",
  // });

  console.log("Download Report PDF:", id);

  return {
    success: true,
    message: "PDF functionality not connected yet.",
  };
};

// =========================
// Close Report
// =========================

export const closeReport = async (
  id: string,
  data: {
    actionTaken: string;
    completionRemarks?: string;
    closedBy?: string;
    closedAt?: string;
    proofFiles?: string[];
  }
) => {
  const res = await api.patch(`/reports/${id}/close`, data);
  return res.data.data;
};

// =========================
// Update Report
// =========================

export const updateReport = async (
  id: string,
  data: {
    findings?: string;
    severity?: string;
    actionTaken?: string;
    completionRemarks?: string;
    status?: string;
  }
) => {
  const res = await api.patch(`/reports/${id}`, data);
  return res.data.data;
};