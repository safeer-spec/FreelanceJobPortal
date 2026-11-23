const API_BASE_URL = (import.meta.env.VITE_BASE_UTL || "http://localhost:8500/api/v1").replace(/\/+$/, "");

async function supportRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { credentials: "include", ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  } catch {
    throw new Error("Could not connect to the support service. Make sure the backend is running.");
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "The support request failed.");
  return result;
}

export function submitPremiumSupportRequest(data) {
  return supportRequest("/freelancer/premium/support", { method: "POST", body: JSON.stringify(data) });
}
export function getMyPremiumSupportRequests() {
  return supportRequest("/freelancer/premium/support/mine");
}
export function getPremiumSupportInbox() {
  return supportRequest("/admin/premium-support");
}
export function replyToPremiumSupportRequest(id, reply) {
  return supportRequest(`/admin/premium-support/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ reply }) });
}
