import api from "./api";

export const getScheduledAudits = async () => {
  const res = await api.get("/scheduled-audits");
  return res.data.data;
};

export const getScheduledAuditById = async (id: string) => {
  const res = await api.get(`/scheduled-audits/${id}`);
  return res.data.data;
};

export const createScheduledAudit = async (payload: any) => {
  const res = await api.post("/scheduled-audits", payload);
  return res.data.data;
};

export const updateScheduledAudit = async (
  id: string,
  payload: any
) => {
  const res = await api.put(
    `/scheduled-audits/${id}`,
    payload
  );

  return res.data.data;
};

export const deleteScheduledAudit = async (
  id: string
) => {
  await api.delete(`/scheduled-audits/${id}`);
};

export const markMailSent = async (id: string) => {
  const res = await api.patch(
    `/scheduled-audits/${id}/mail-sent`
  );

  return res.data.data;
};