import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProfile } from "../services/profileservices";
import "./freelancerResume.css";

export default function FreelancerResume() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getMyProfile("freelancer")
      .then((result) => { if (active) setProfile(result); })
      .catch((requestError) => { if (active) setError(requestError.message || "Could not load your profile."); });
    return () => { active = false; };
  }, []);

  return (
    <section className="freelancer-resume" aria-labelledby="freelancer-resume-title">
      <header className="freelancer-resume__heading">
        <div>
          <p className="profile-layout__eyebrow">Professional profile</p>
          <h2 id="freelancer-resume-title">My profile</h2>
          <p>Your experience, skills, and portfolio details appear here.</p>
        </div>
        <Link to="/profile">Edit profile</Link>
      </header>
      {error && <p className="freelancer-resume__empty" role="alert">{error}</p>}
      <div className="freelancer-resume__layout">
        {profile && (
          <article className="freelancer-resume__paper">
          <div className="freelancer-resume__identity">
            <span className="freelancer-resume__photo">
              {profile.profilePhoto ? <img src={profile.profilePhoto} alt="" /> : (profile.name || "F").trim().charAt(0).toUpperCase()}
            </span>
            <div>
              <h3>{profile.name || "Your name"}</h3>
              {profile.headline && <p className="freelancer-resume__headline">{profile.headline}</p>}
              <p>{[profile.email, profile.phone, profile.location].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
          {profile.bio && <section><h4>About</h4><p>{profile.bio}</p></section>}
          {profile.skills?.length > 0 && <section><h4>Skills</h4><div className="freelancer-resume__skills">{profile.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section>}
          {profile.experience?.length > 0 && <section><h4>Work experience</h4>{profile.experience.map((item, index) => <div className="freelancer-resume__entry" key={item._id || index}><strong>{item.title || "Experience"}</strong><p>{[item.company, item.location].filter(Boolean).join(" · ")}</p><small>{item.startDate || ""}{item.current ? " – Present" : item.endDate ? ` – ${item.endDate}` : ""}</small>{item.description && <p>{item.description}</p>}</div>)}</section>}
          {profile.education?.length > 0 && <section><h4>Education</h4>{profile.education.map((item, index) => <div className="freelancer-resume__entry" key={item._id || index}><strong>{item.school || "Education"}</strong><p>{[item.degree, item.field].filter(Boolean).join(" · ")}</p><small>{item.startDate || ""}{item.endDate ? ` – ${item.endDate}` : ""}</small>{item.description && <p>{item.description}</p>}</div>)}</section>}
          <section className="freelancer-resume__links">
            {profile.portfolioUrl && <a href={profile.portfolioUrl} target="_blank" rel="noreferrer">Portfolio</a>}
            {profile.websiteUrl && <a href={profile.websiteUrl} target="_blank" rel="noreferrer">Website</a>}
            {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>}
          </section>
            {!profile.headline && !profile.bio && !profile.skills?.length && !profile.experience?.length && !profile.education?.length && <p className="freelancer-resume__empty">Add your professional details to complete your profile.</p>}
          </article>
        )}
        <aside className="freelancer-resume__visual" aria-hidden="true">
          <span className="freelancer-resume__visual-spark freelancer-resume__visual-spark--one">✦</span>
          <span className="freelancer-resume__visual-spark freelancer-resume__visual-spark--two">✧</span>
          <div className="freelancer-resume__visual-card">
            <div className="freelancer-resume__visual-top"><span /><span /><span /></div>
            <div className="freelancer-resume__visual-person"><span>F</span><div><i /><i /></div></div>
            <div className="freelancer-resume__visual-rule" />
            <p>YOUR FREELANCER PROFILE</p>
            <div className="freelancer-resume__visual-tags"><span>Skills</span><span>Projects</span><span>Portfolio</span></div>
            <div className="freelancer-resume__visual-progress"><span /></div>
          </div>
          <span className="freelancer-resume__visual-badge">✦ Showcase your work</span>
        </aside>
      </div>
    </section>
  );
}
