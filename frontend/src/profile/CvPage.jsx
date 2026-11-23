import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getMyProfile, updateMyProfile } from "../services/profileservices";
import "./cvPage.css";

function readRole() {
  try { return JSON.parse(sessionStorage.getItem("jobportal.profile") || "null")?.role || null; }
  catch { return null; }
}

export default function CvPage() {
  const navigate = useNavigate();
  const role = readRole();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    getMyProfile("freelancer")
      .then((data) => { if (active) setProfile(data); })
      .catch((requestError) => { if (active) setError(requestError.message || "Could not load your CV."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (role !== "freelancer") return <Navigate to="/login?role=freelancer" replace />;

  const hasCv = Boolean(profile && (
    profile.headline || profile.bio || profile.location || profile.skills?.length ||
    profile.portfolioUrl || profile.websiteUrl || profile.linkedinUrl ||
    profile.experience?.length || profile.education?.length
  ));

  async function handleDelete() {
    if (!window.confirm("Delete your saved CV details? Your name and account contact information will remain.")) return;
    setDeleting(true);
    setError("");
    try {
      const result = await updateMyProfile("freelancer", {
        headline: "",
        bio: "",
        location: "",
        skills: [],
        portfolioUrl: "",
        websiteUrl: "",
        linkedinUrl: "",
        experience: [],
        education: [],
      });
      setProfile(result.profile);
      const savedAccount = JSON.parse(sessionStorage.getItem("jobportal.profile") || "{}");
      sessionStorage.setItem("jobportal.profile", JSON.stringify({ ...savedAccount, ...result.profile, role: "freelancer" }));
      window.dispatchEvent(new Event("jobportal:profile-updated"));
    } catch (requestError) {
      setError(requestError.message || "Could not delete your CV.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <main className="cv-page"><p>Loading CV…</p></main>;

  return (
    <main className="cv-page">
      {error && <p className="cv-page__error" role="alert">{error}</p>}
      {profile && (
        <article className="cv-paper">
          <header className="cv-paper__identity">
            {profile.profilePhoto && <img src={profile.profilePhoto} alt="" />}
            <div>
              <h1>{profile.name}</h1>
              {profile.headline && <p className="cv-paper__headline">{profile.headline}</p>}
              <p>{[profile.email, profile.phone, profile.location].filter(Boolean).join(" · ")}</p>
            </div>
          </header>
          {profile.bio && <section className="cv-paper__section"><h2>About</h2><p>{profile.bio}</p></section>}
          {profile.skills?.length > 0 && <section className="cv-paper__section"><h2>Skills</h2><ul className="cv-paper__skills">{profile.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul></section>}
          {profile.experience?.length > 0 && <section className="cv-paper__section"><h2>Work experience</h2>{profile.experience.map((item, index) => <article className="cv-paper__entry" key={item._id || index}><h3>{item.title || "Experience"}</h3>{(item.company || item.location) && <p className="cv-paper__entry-meta">{[item.company, item.location].filter(Boolean).join(" · ")}</p>}<p className="cv-paper__entry-meta">{item.startDate || ""}{item.current ? " – Present" : item.endDate ? ` – ${item.endDate}` : ""}</p>{item.description && <p>{item.description}</p>}</article>)}</section>}
          {profile.education?.length > 0 && <section className="cv-paper__section"><h2>Education</h2>{profile.education.map((item, index) => <article className="cv-paper__entry" key={item._id || index}><h3>{item.school || "Education"}</h3>{(item.degree || item.field) && <p className="cv-paper__entry-meta">{[item.degree, item.field].filter(Boolean).join(" · ")}</p>}{(item.startDate || item.endDate) && <p className="cv-paper__entry-meta">{item.startDate || ""}{item.endDate ? ` – ${item.endDate}` : ""}</p>}{item.description && <p>{item.description}</p>}</article>)}</section>}
          {(profile.portfolioUrl || profile.websiteUrl || profile.linkedinUrl) && <section className="cv-paper__section"><h2>Links</h2><div className="cv-paper__links">{profile.portfolioUrl && <a href={profile.portfolioUrl} target="_blank" rel="noreferrer">Portfolio</a>}{profile.websiteUrl && <a href={profile.websiteUrl} target="_blank" rel="noreferrer">Website</a>}{profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>}</div></section>}
          {!hasCv && <p className="cv-paper__empty">Your CV is empty. Create your CV to add your skills and experience.</p>}
        </article>
      )}
      {profile && (
        <div className="cv-page__actions">
          {hasCv ? (
            <>
              <button type="button" onClick={() => navigate("/profile/cv/edit")}>Edit CV</button>
              <button type="button" className="is-delete" disabled={deleting} onClick={handleDelete}>{deleting ? "Deleting…" : "Delete CV"}</button>
            </>
          ) : (
            <button type="button" onClick={() => navigate("/profile/cv/edit")}>Create CV</button>
          )}
        </div>
      )}
    </main>
  );
}
