import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";
import Darkmode from "../compo/shared/Darkmode.jsx";
import { logoutAccount } from "../services/authservices";
import LocationAccess from "./LocationAccess.jsx";
import { setAppLanguage, supportedLanguages, useAppLanguage } from "../services/language.js";
import { useNotifications } from "../services/NotificationsContext.jsx";

const MENU = {
  intro: {
    title: "Learn about Upskill",
    path: "/learnAboutUpskill",
    text: "Get to know the platform built to help you grow your skills.",
  },
  sections: [
    {
      label: "Resources",
      items: [
        {
          title: "Success stories",
          text: "See how learners reached their goals",
          path: "/success-stories",
        },
        {
          title: "Reviews",
          text: "Read what people say about Upskill",
          path: "/reviews",
        },
        {
          title: "How to learn",
          text: "Find the right path for your goals",
          path: "/how-to-learn",
        },
        {
          title: "How to teach",
          text: "Share your skills with others",
          path: "/how-to-teach",
        },
      ],
    },
    {
      label: "What's new",
      items: [
        {
          title: "Upskill updates",
          text: "Our latest features and partners",
          path: "/updates",
        },
        {
          title: "Research",
          text: "Insights on skills and careers",
          path: "/research",
        },
      ],
    },
  ],
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("jobportal.profile") || "null");
    } catch {
      return null;
    }
  });
  const [loggingOut, setLoggingOut] = useState(false);
  const { language, t } = useAppLanguage();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const profileRef = useRef(null);
  const whyRef = useRef(null);
  const megaRef = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setMenuOpen(false);
      }

      const clickedInsideWhyMenu =
        whyRef.current?.contains(event.target) ||
        megaRef.current?.contains(event.target);

      if (!clickedInsideWhyMenu) {
        setWhyOpen(false);
      }
    };

    const syncProfile = () => {
      try { setProfile(JSON.parse(sessionStorage.getItem("jobportal.profile") || "null")); }
      catch { setProfile(null); }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setWhyOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("jobportal:profile-updated", syncProfile);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("jobportal:profile-updated", syncProfile);
    };
  }, []);

  const closeWhyMenu = () => setWhyOpen(false);

  async function handleLogout() {
    if (!profile?.role || loggingOut) return;
    setLoggingOut(true);
    try {
      await logoutAccount(profile.role);
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      sessionStorage.removeItem("jobportal.profile");
      setProfile(null);
      window.dispatchEvent(new Event("jobportal:profile-updated"));
      setMenuOpen(false);
      setLoggingOut(false);
      navigate("/jobs", { replace: true });
    }
  }

  return (
    <nav className="navbar" aria-label="Main">
      <Link to="/jobs" className="logo" onClick={closeWhyMenu}>
        <img src="/logo.svg" alt="Upskill home" />
      </Link>
      <ul className="nav-links">
        <li ref={whyRef}>
          <button
            type="button"
            className={`why-btn ${whyOpen ? "open" : ""}`}
            aria-expanded={whyOpen}
            aria-controls="why-menu"
            onClick={() => {
              setWhyOpen((open) => !open);
              setMenuOpen(false);
            }}
          >
            {t("Why upskill?")}
            <svg viewBox="0 0 24 24" className="chevron" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </li>
      </ul>
      <div
        id="why-menu"
        ref={megaRef}
        className={`mega ${whyOpen ? "open" : ""}`}
      >
        <div className="mega-main">
          <div className="mega-intro">
            <Link
              to={MENU.intro.path}
              className="mega-item"
              onClick={closeWhyMenu}
            >
              <strong>{t(MENU.intro.title)}</strong>
              <span>{t(MENU.intro.text)}</span>
            </Link>
          </div>

          <div className="mega-sections">
            {MENU.sections.map((section) => (
              <div key={section.label} className="mega-section">
                <h4>{t(section.label)}</h4>

                <ul className="mega-grid">
                  {section.items.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className="mega-item"
                        onClick={closeWhyMenu}
                      >
                        <strong>{t(item.title)}</strong>
                        <span>{t(item.text)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="nav-right navbar-end gap-5">
        <Darkmode />
        <label className="navbar-language" title={t("Language")}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>
          <select aria-label={t("Language")} value={language} onChange={(event) => setAppLanguage(event.target.value)}>
            {supportedLanguages.map((item) => <option key={item.code} value={item.code}>{item.nativeName}</option>)}
          </select>
        </label>
        {profile?.role !== "admin" && profile?.role !== "client" && <Link
          to="/liked"
          className="liked-btn"
          aria-label="Open liked jobs"
          title="Liked jobs"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
          </svg>
          <span>{t("Liked")}</span>
        </Link>}
        <LocationAccess />

        <div className="profile" ref={profileRef}>
          <button
            type="button"
            className="profile-btn"
            aria-label={t("Open account menu")}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen((open) => !open);
              setWhyOpen(false);
            }}
          >
            {unreadCount > 0 && <span className="profile-notification-badge" aria-label={`${unreadCount} unread notifications`}>{unreadCount > 99 ? "99+" : unreadCount}</span>}
            {profile?.profilePhoto ? (
              <img className="profile-btn__image" src={profile.profilePhoto} alt="" />
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
              </svg>
            )}
          </button>
          <div className={"dropdown " + (menuOpen ? "open" : "")} role="menu">
            <div className="mobile-profile-shortcuts">
              {profile?.role !== "admin" && profile?.role !== "client" && (
                <Link to="/liked" role="menuitem" className="profile-menu-link mobile-liked-link" onClick={() => setMenuOpen(false)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>
                  {t("Liked")}
                </Link>
              )}
              <div className="mobile-location-link"><LocationAccess /></div>
            </div>
            {profile ? (
              <>
                <div className="who">
                  <strong>{profile.name || "Account"}</strong>
                  <small>{profile.role + " Â· " + (profile.email || "account")}</small>
                </div>
                <Link
                  to="/notifications"
                  role="menuitem"
                  className="profile-menu-link profile-notifications-link"
                  onClick={() => setMenuOpen(false)}
                >
                  <span>Notifications</span>
                  {unreadCount > 0 && <span className="profile-notification-count">{unreadCount > 99 ? "99+" : unreadCount}</span>}
                </Link>
                <Link
                  to="/profile"
                  role="menuitem"
                  className="profile-menu-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("My profile")}
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  className="profile-logout"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? t("Logging outâ€¦") : t("Log out")}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/account"
                  role="menuitem"
                  className="Sign"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("Sign Up")}
                </Link>
                <Link
                  to="/login"
                  role="menuitem"
                  className="Log"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("Log in")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


