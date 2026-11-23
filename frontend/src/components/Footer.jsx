import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./footer.css";



function Footer() {
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("jobportal.profile") || "null"); }
    catch { return null; }
  });

  useEffect(() => {
    const syncProfile = () => {
      try { setProfile(JSON.parse(sessionStorage.getItem("jobportal.profile") || "null")); }
      catch { setProfile(null); }
    };
    window.addEventListener("jobportal:profile-updated", syncProfile);
    window.addEventListener("storage", syncProfile);
    return () => {
      window.removeEventListener("jobportal:profile-updated", syncProfile);
      window.removeEventListener("storage", syncProfile);
    };
  }, []);

  const loggedIn = Boolean(profile);
  const showJobSeekerLinks = !profile || profile.role === "freelancer";

  return (
    <footer className={"footer" + (loggedIn ? " footer--logged-in" : "")} id="about">

      <div className="footer-container">


        <div className="footer-brand">

          <div className="footer-logo">
            <img src="/logo.svg" alt="UpSkill.io" />
          </div>

          <h2>UpSkill.io</h2>

          <p>
            Connecting talented people with great career opportunities.
            Find your dream job and build your career with us.
          </p>

          <span className="established">
            Established in 2016
          </span>

        </div>



        {showJobSeekerLinks && (
          <div className="footer-column">
            <h3>Job Seekers</h3>
            <Link to={profile ? "/freelancer#job-listings" : "/jobs#job-listings"}>Find Jobs</Link>
            {(!profile || profile.role === "freelancer") && <a href={profile ? "/profile" : "/account"}>Create Resume</a>}
          </div>
        )}

        <div className="footer-column">
          <h3>Company</h3>

          <a href="/about">About Us</a>
          <a href="/contact">Contact Us</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms & Conditions</a>
        </div>

      </div>


      <div className="footer-bottom">

        <div>
          <h3>Follow Us</h3>

          <div className="social-icons">

            <a href="#">
              <i className="fa-brands fa-facebook-f"></i>
            </a>

            <a href="#">
              <i className="fa-brands fa-instagram"></i>
            </a>

            <a href="#">
              <i className="fa-brands fa-linkedin-in"></i>
            </a>

            <a href="#">
              <i className="fa-brands fa-x-twitter"></i>
            </a>

            <a href="#">
              <i className="fa-brands fa-youtube"></i>
            </a>

          </div>
        </div>


        <div className="contact-info">
          <p>📧 support@upskill.com</p>
          <p>📞 +91 9876543210</p>
        </div>

      </div>


      <div className="copyright">
        © 2026 upskill.JobPortal. All rights reserved.
      </div>

    </footer>
  );
}

export default Footer;
