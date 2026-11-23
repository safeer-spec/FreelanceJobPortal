import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { getMyProfile } from "../services/profileservices";
import "./profileSettings.css";

function readAccount() {
  try { return JSON.parse(sessionStorage.getItem("jobportal.profile") || "null"); }
  catch { return null; }
}

export default function ProfilePage() {
  const [account] = useState(readAccount);
  const role = account?.role;
  const [profile, setProfile] = useState(account || {});
  const [loading, setLoading] = useState(Boolean(role));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!role) return undefined;
    let active = true;
    getMyProfile(role)
      .then((data) => {
        if (!active) return;
        setProfile(data);
        sessionStorage.setItem("jobportal.profile", JSON.stringify({ ...data, role }));
        window.dispatchEvent(new Event("jobportal:profile-updated"));
      })
      .catch((requestError) => { if (active) setError(requestError.message || "Could not load your account."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [role]);

  if (!role) return <Navigate to="/login" replace />;

  return (
    <>
      <Navbar />
      <main className="profile-settings">
        <header className="profile-settings__heading">
          <p className="profile-layout__eyebrow">Your account</p>
          <h1>Personal details</h1>
          <p>View and update the details connected to your account.</p>
        </header>
        {loading && <p className="profile-settings__message">Loading your account…</p>}
        {error && <p className="profile-settings__alert is-error" role="alert">{error}</p>}
        {!loading && !error && (
          <section className="profile-settings__summary">
            <div className="profile-settings__photo">
              {profile.profilePhoto ? <img src={profile.profilePhoto} alt="" /> : <span>{(profile.name || "U").trim().charAt(0).toUpperCase()}</span>}
            </div>
            <div className="profile-settings__summary-identity">
              <p className="profile-layout__eyebrow">Signed in as</p>
              <h2>{profile.name || "Your name"}</h2>
              <p>{profile.email || "No email saved"}</p>
              {profile.phone && <p>{profile.phone}</p>}
            </div>
            <div className="profile-settings__summary-actions">
              <Link to="/profile/details">Edit details</Link>
              {role === "freelancer" && <Link to="/profile/cv">View CV</Link>}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
