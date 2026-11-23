import { Navigate, useNavigate } from "react-router-dom";
import "./welcomePage.css";

function readAccount() {
  try { return JSON.parse(sessionStorage.getItem("jobportal.profile") || "null"); }
  catch { return null; }
}

export default function WelcomePage() {
  const navigate = useNavigate();
  const account = readAccount();
  if (account?.role) return <Navigate to="/jobs" replace />;

  function enterHome() {
    navigate("/jobs", { replace: true });
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      enterHome();
    }
  }

  return (
    <div
      className="upskill-welcome"
      tabIndex={0}
      role="link"
      aria-label="Welcome to UpSkill.io. Click anywhere to enter the website."
      onClick={enterHome}
      onKeyDown={handleKeyDown}
    >
      <div className="upskill-welcome__ambient" aria-hidden="true">
        <div className="upskill-welcome__grid" />
        <div className="upskill-welcome__glow upskill-welcome__glow--teal" />
        <div className="upskill-welcome__glow upskill-welcome__glow--violet" />
        <div className="upskill-welcome__orbit upskill-welcome__orbit--outer"><i /><i /><i /></div>
        <div className="upskill-welcome__orbit upskill-welcome__orbit--inner"><i /><i /></div>
        <div className="upskill-welcome__spark upskill-welcome__spark--one" />
        <div className="upskill-welcome__spark upskill-welcome__spark--two" />
      </div>

      <main className="upskill-welcome__content">
        <div className="upskill-welcome__topline">
          <img src="/logo.svg" alt="" />
          <span>Learn. Build. Rise.</span>
        </div>

        <div className="upskill-welcome__headline">
          <p className="upskill-welcome__eyebrow"><span /> A new path starts here</p>
          <h1>Make your next<br /><span>move matter.</span></h1>
          <p className="upskill-welcome__brand">upskill<span>.io</span></p>
        </div>

        <p className="upskill-welcome__description">
          Discover your potential. Build skills that open doors.
        </p>

        <div className="upskill-welcome__footer">
          <span>YOUR FUTURE, IN PROGRESS</span>
          <span className="upskill-welcome__footer-line" />
          <span>01 / BEGIN</span>
        </div>
      </main>
    </div>
  );
}
