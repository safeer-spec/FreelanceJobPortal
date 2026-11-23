import { API_BASE_URL } from "./apiBase.js";


async function paymentRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
  } catch {
    throw new Error("Could not connect to the payment server. Please try again.");
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "The payment request failed.");
  return result;
}

export async function createCheckoutSession(role, plan) {
  if (!["client", "freelancer"].includes(role)) throw new Error("Choose a valid account type.");
  const result = await paymentRequest(`/payment/checkout/${role}`, {
    method: "POST",
    body: JSON.stringify(plan ? { plan } : {}),
  });
  if (!result.url) throw new Error("Stripe did not return a checkout link.");
  return result.url;
}

export function verifyCheckoutSession(role, sessionId) {
  if (!["client", "freelancer"].includes(role)) throw new Error("Choose a valid account type.");
  return paymentRequest(`/payment/session/${role}/${encodeURIComponent(sessionId)}`);
}

export async function createBillingPortalSession(role) {
  if (!["client", "freelancer"].includes(role)) throw new Error("Choose a valid account type.");
  const result = await paymentRequest(`/payment/portal/${role}`, { method: "POST", body: "{}" });
  if (!result.url) throw new Error("Stripe did not return a billing link.");
  return result.url;
}
