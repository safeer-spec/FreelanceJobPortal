let redirecting = false;

export function handleUnauthorized(roleHint) {
  let profile = null;
  try { profile = JSON.parse(sessionStorage.getItem("jobportal.profile") || "null"); } catch { profile = null; }
  const roles = ["admin", "client", "freelancer"];
  const role = roles.includes(profile?.role) ? profile.role : (roles.includes(roleHint) ? roleHint : null);

  if (profile) {
    sessionStorage.removeItem("jobportal.profile");
    window.dispatchEvent(new Event("jobportal:profile-updated"));
  }
  if (!role || window.location.pathname === "/login" || redirecting) return;
  redirecting = true;
  window.location.replace(`/login?role=${encodeURIComponent(role)}`);
}
