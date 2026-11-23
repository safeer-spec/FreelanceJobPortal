import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./accountPage.css";

function ClientIcon() {
  return (
    <svg
      className="clienticon"
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="28" cy="20" r="8" stroke="currentColor" strokeWidth="3" />
      <path
        d="M10 52c0-10 7-17 18-17"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        x="32"
        y="40"
        width="28"
        height="20"
        rx="4"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M40 40v-3a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path d="M32 50h28" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

function FreelancerIcon() {
  return (
    <svg
      className="freelancericon"
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="28" cy="20" r="8" stroke="currentColor" strokeWidth="3" />
      <path
        d="M10 52c0-10 7-17 18-17"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M24 60l4-16h30l-4 16H24z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="43" cy="52" r="2" fill="currentColor" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg
      className="adminIcon"
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="36" cy="23" r="9" stroke="currentColor" strokeWidth="3" />
      <path
        d="M18 58c0-11 7-18 18-18s18 7 18 18"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M48 15l3 3 6-6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Arrow() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ROLES = [
  {
    id: "freelancer",
    title: "Freelancer",
    note: "Work and get paid",
    cta: "Apply as a freelancer",
    Icon: FreelancerIcon,
  },
  {
    id: "client",
    title: "Client",
    note: "Post jobs and hire",
    cta: "Join as a client",
    Icon: ClientIcon,
  },
  {
    id: "admin",
    title: "Admin",
    note: "Manage the platform",
    cta: "Continue as an admin",
    Icon: AdminIcon,
  },
];

export default function AccountPage() {
  const [role, setRole] = useState("freelancer");
  const navigate = useNavigate();
  const current = ROLES.find((item) => item.id === role);

  function handleContinue() {
navigate(`/signup?role=${role}`);
  }

  return (
    <div className="wl">
      <header className="wl-top">
        <span className="wl-logo">upwork.io</span>
      </header>

      <main className="wl-main">
        <h1>Welcome to Upwork.io</h1>
        <p className="wl-sub" id="role-label">
          Which describes you best?
        </p>

        <div className="wl-cards" role="radiogroup" aria-labelledby="role-label">
          {ROLES.map(({ id, title, note, Icon }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={role === id}
              className={`wl-card wl-card--${id}${
                role === id ? " is-selected" : ""
              }`}
              onClick={() => setRole(id)}
            >
              <span className="wl-tile">
                <Icon />
              </span>

              <span className="wl-title">
                {title}
                <Arrow />
              </span>

              <span className="wl-note">{note}</span>
            </button>
          ))}
        </div>

        <button className="wl-cta" type="button" onClick={handleContinue}>
          {current.cta}
        </button>

        <p className="wl-login">
          Already have an account? <Link to={"/login?role=" + role}>Log in</Link>
        </p>
      </main>
    </div>
  );
}