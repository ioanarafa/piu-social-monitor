export const API = "http://localhost:3001/api";

export async function apiGet(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error("GET failed");
  return res.json();
}

export async function apiSend(path, method, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error("SEND failed");
  return res.json().catch(() => ({}));
}
