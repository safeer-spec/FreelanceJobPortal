import { API_BASE_URL } from "./apiBase.js";
import { handleUnauthorized } from "./authSession.js";



const ROLE_PATHS = {
  freelancer: "/freelancer/profile",
  client: "/client/profile",
  admin: "/admin/profile",
};

async function profileRequest(role, method, data) {
  const path = ROLE_PATHS[role];
  if (!path) throw new Error("Choose a valid account role.");
  let response;
  try {
    response = await fetch(API_BASE_URL + path, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    });
  } catch {
    throw new Error("Could not connect to the server. Make sure the backend is running.");
  }
  const result = await response.json().catch(() => ({}));
  if (response.status === 401) handleUnauthorized(role);
  if (!response.ok) throw new Error(result.message || result.error || "Could not save profile.");
  return result;
}

export async function getMyProfile(role) {
  return profileRequest(role, "GET");
}

export async function updateMyProfile(role, data) {
  return profileRequest(role, "PUT", data);
}
