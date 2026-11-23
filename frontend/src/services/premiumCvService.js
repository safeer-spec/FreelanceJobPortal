const API_BASE_URL = (import.meta.env.VITE_BASE_UTL || "http://localhost:8500/api/v1").replace(/\/+$/, "");

export async function reviewCvWithAi(data) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/freelancer/premium/cv-review`, {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
  } catch {
    throw new Error("Could not connect to the AI review service. Make sure the backend is running.");
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "AI review could not be completed.");
  return result;
}
