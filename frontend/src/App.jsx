import { RouterProvider } from "react-router-dom";
import { useEffect, useState } from "react";
import { NotificationsProvider } from "./services/NotificationsContext.jsx";
import { router } from "./routes/routes.jsx";
import "./index.css";

export default function App() {
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("jobportal.profile") || "null"); } catch { return null; }
  });
  useEffect(() => {
    const syncProfile = () => { try { setProfile(JSON.parse(sessionStorage.getItem("jobportal.profile") || "null")); } catch { setProfile(null); } };
    window.addEventListener("jobportal:profile-updated", syncProfile);
    return () => window.removeEventListener("jobportal:profile-updated", syncProfile);
  }, []);
  return <NotificationsProvider profile={profile}><RouterProvider router={router} /></NotificationsProvider>;
}


