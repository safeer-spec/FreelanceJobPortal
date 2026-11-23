import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import "./profileLayout.css";

function getProfile() {
  try {
    return JSON.parse(sessionStorage.getItem("jobportal.profile") || "null");
  } catch {
    return null;
  }
}

export default function ProfileLayout({ role, title, children }) {
  const profile = getProfile();

  if (!profile || profile.role !== role) {
    return <Navigate to={"/login?role=" + role} replace />;
  }

  return (
    <>
      <Navbar />
      <main className="profile-layout">
        <header className="profile-layout__header">
          <div className="profile-layout__identity">
            <span className="profile-layout__avatar" aria-hidden="true">
              {profile.profilePhoto
                ? <img src={profile.profilePhoto} alt="" />
                : (profile.name || "U").trim().charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="profile-layout__eyebrow">{role} profile</p>
              <h1>{title}</h1>
              <p className="profile-layout__signed-in">
                Signed in as <strong>{profile.name}</strong>
                {profile.email ? " · " + profile.email : ""}
              </p>
            </div>
          </div>
          <span className="profile-layout__role">
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        </header>
        <div className="profile-layout__content">{children}</div>
      </main>
      <Footer />
    </>
  );
}
