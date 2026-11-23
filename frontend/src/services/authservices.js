const ROLE_PATHS = {
  admin: "/admin",
  client: "/client",
  freelancer: "/freelancer",
};

const API_BASE_URL = (
  import.meta.env.VITE_BASE_UTL || "http://localhost:8500/api/v1"
).replace(/\/+$/, "");

async function authRequest(role, action, data) {
  const rolePath = ROLE_PATHS[role];
  if (!rolePath) {
    throw new Error("Choose a valid account type.");
  }

  let response;
  try {
    response = await fetch(API_BASE_URL + rolePath + "/" + action, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error("Could not connect to the server. Make sure the backend is running.");
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || result.error || "Authentication failed.");
  }
  return result;
}

export function registerAccount(role, data) {
  return authRequest(role, "register", data);
}

export function loginAccount(role, data) {
  return authRequest(role, "login", data);
}

export function logoutAccount(role) {
  return authRequest(role, "logout", {});
}
