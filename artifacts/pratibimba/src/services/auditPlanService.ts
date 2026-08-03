const BASE_URL =
  "https://bug-free-eureka-r4jrjvp4ppjxfwqp5-5000.app.github.dev/api/v1/audit-plans";

function authHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse(res: Response) {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export async function getAuditPlans() {
  const res = await fetch(BASE_URL, {
    headers: authHeaders(),
  });

  return handleResponse(res);
}

export async function createAuditPlan(data: any) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

export async function updateAuditPlan(id: string, data: any) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

export async function deleteAuditPlan(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return handleResponse(res);
}

export async function scheduleAudit(id: string, data: any) {
  const res = await fetch(`${BASE_URL}/${id}/schedule`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}