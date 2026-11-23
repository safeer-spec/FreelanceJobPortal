import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { getMyProfile, updateMyProfile } from "../services/profileservices";
import "./profileSettings.css";

const EMPTY_EXPERIENCE = { title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" };
const EMPTY_EDUCATION = { school: "", degree: "", field: "", startDate: "", endDate: "", description: "" };

function readAccount() {
  try { return JSON.parse(sessionStorage.getItem("jobportal.profile") || "null"); }
  catch { return null; }
}

function cvFields(data = {}) {
  return {
    headline: data.headline || "", location: data.location || "", bio: data.bio || "",
    skills: Array.isArray(data.skills) ? data.skills : [],
    portfolioUrl: data.portfolioUrl || "", websiteUrl: data.websiteUrl || "", linkedinUrl: data.linkedinUrl || "",
    experience: Array.isArray(data.experience) ? data.experience : [],
    education: Array.isArray(data.education) ? data.education : [],
  };
}

export default function CvEditorPage() {
  const account = readAccount();
  const role = account?.role;
  const navigate = useNavigate();
  const [cv, setCv] = useState(() => cvFields(account || {}));
  const [skillsText, setSkillsText] = useState(() => (account?.skills || []).join(", "));
  const [loading, setLoading] = useState(Boolean(role));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role !== "freelancer") return undefined;
    let active = true;
    getMyProfile("freelancer")
      .then((data) => {
        if (!active) return;
        const next = cvFields(data);
        setCv(next);
        setSkillsText(next.skills.join(", "));
      })
      .catch((requestError) => { if (active) setError(requestError.message || "Could not load your CV."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [role]);

  if (role !== "freelancer") return <Navigate to="/login?role=freelancer" replace />;

  function setField(event) {
    setCv((current) => ({ ...current, [event.target.name]: event.target.value }));
  }
  function updateRow(listName, index, field, value) {
    setCv((current) => ({ ...current, [listName]: current[listName].map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row) }));
  }
  function addRow(listName, template) {
    setCv((current) => ({ ...current, [listName]: [...current[listName], { ...template }] }));
  }
  function removeRow(listName, index) {
    setCv((current) => ({ ...current, [listName]: current[listName].filter((_, rowIndex) => rowIndex !== index) }));
  }

  async function saveCv(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        headline: cv.headline.trim(), location: cv.location.trim(), bio: cv.bio.trim(),
        skills: skillsText.split(",").map((skill) => skill.trim()).filter(Boolean),
        portfolioUrl: cv.portfolioUrl.trim(), websiteUrl: cv.websiteUrl.trim(), linkedinUrl: cv.linkedinUrl.trim(),
        experience: cv.experience, education: cv.education,
      };
      const result = await updateMyProfile("freelancer", payload);
      sessionStorage.setItem("jobportal.profile", JSON.stringify({ ...result.profile, role }));
      window.dispatchEvent(new Event("jobportal:profile-updated"));
      navigate("/profile/cv", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Could not save your CV.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="profile-settings">
        <header className="profile-settings__heading">
          <p className="profile-layout__eyebrow">Professional profile</p>
          <h1>Edit your CV</h1>
          <p>Update the experience and skills shown on your CV. Account details are edited separately.</p>
        </header>
        {loading ? <p className="profile-settings__message">Loading your CV…</p> : (
          <form className="profile-settings__form" onSubmit={saveCv}>
            <section className="profile-settings__section">
              <h2>Professional summary</h2>
              <div className="profile-settings__grid">
                <label>Professional headline<input name="headline" value={cv.headline} onChange={setField} placeholder="e.g. Full-stack web developer" maxLength={160} /></label>
                <label>Location<input name="location" value={cv.location} onChange={setField} placeholder="City, country" maxLength={120} /></label>
              </div>
              <label className="profile-settings__wide">About me<textarea name="bio" value={cv.bio} onChange={setField} rows={5} maxLength={2000} placeholder="Write a short introduction about your work." /></label>
              <label className="profile-settings__wide">Skills <span className="profile-settings__hint">Separate skills with commas</span><input value={skillsText} onChange={(event) => setSkillsText(event.target.value)} placeholder="React, design, project management" /></label>
              <div className="profile-settings__grid">
                <label>Portfolio<input name="portfolioUrl" type="url" value={cv.portfolioUrl} onChange={setField} placeholder="https://" /></label>
                <label>Website<input name="websiteUrl" type="url" value={cv.websiteUrl} onChange={setField} placeholder="https://" /></label>
                <label>LinkedIn<input name="linkedinUrl" type="url" value={cv.linkedinUrl} onChange={setField} placeholder="https://linkedin.com/in/…" /></label>
              </div>
            </section>
            <section className="profile-settings__section">
              <div className="profile-settings__section-heading"><h2>Work experience</h2><button type="button" onClick={() => addRow("experience", EMPTY_EXPERIENCE)}>Add experience</button></div>
              {cv.experience.length === 0 && <p className="profile-settings__empty">Add roles and projects you have worked on.</p>}
              {cv.experience.map((item, index) => (
                <fieldset className="profile-settings__repeat" key={item._id || index}>
                  <legend>Experience {index + 1}</legend>
                  <button className="profile-settings__remove" type="button" onClick={() => removeRow("experience", index)}>Remove</button>
                  <div className="profile-settings__grid">
                    <label>Job title<input value={item.title || ""} onChange={(event) => updateRow("experience", index, "title", event.target.value)} /></label>
                    <label>Company<input value={item.company || ""} onChange={(event) => updateRow("experience", index, "company", event.target.value)} /></label>
                    <label>Location<input value={item.location || ""} onChange={(event) => updateRow("experience", index, "location", event.target.value)} /></label>
                    <label>Start date<input type="month" value={item.startDate || ""} onChange={(event) => updateRow("experience", index, "startDate", event.target.value)} /></label>
                    <label>End date<input type="month" value={item.endDate || ""} disabled={item.current} onChange={(event) => updateRow("experience", index, "endDate", event.target.value)} /></label>
                    <label className="profile-settings__checkbox"><input type="checkbox" checked={Boolean(item.current)} onChange={(event) => updateRow("experience", index, "current", event.target.checked)} />I currently work here</label>
                  </div>
                  <label className="profile-settings__wide">What you did<textarea rows={3} value={item.description || ""} onChange={(event) => updateRow("experience", index, "description", event.target.value)} /></label>
                </fieldset>
              ))}
            </section>
            <section className="profile-settings__section">
              <div className="profile-settings__section-heading"><h2>Education</h2><button type="button" onClick={() => addRow("education", EMPTY_EDUCATION)}>Add education</button></div>
              {cv.education.length === 0 && <p className="profile-settings__empty">Add your education or training.</p>}
              {cv.education.map((item, index) => (
                <fieldset className="profile-settings__repeat" key={item._id || index}>
                  <legend>Education {index + 1}</legend>
                  <button className="profile-settings__remove" type="button" onClick={() => removeRow("education", index)}>Remove</button>
                  <div className="profile-settings__grid">
                    <label>School or institution<input value={item.school || ""} onChange={(event) => updateRow("education", index, "school", event.target.value)} /></label>
                    <label>Degree or certificate<input value={item.degree || ""} onChange={(event) => updateRow("education", index, "degree", event.target.value)} /></label>
                    <label>Field of study<input value={item.field || ""} onChange={(event) => updateRow("education", index, "field", event.target.value)} /></label>
                    <label>Start date<input type="month" value={item.startDate || ""} onChange={(event) => updateRow("education", index, "startDate", event.target.value)} /></label>
                    <label>End date<input type="month" value={item.endDate || ""} onChange={(event) => updateRow("education", index, "endDate", event.target.value)} /></label>
                  </div>
                  <label className="profile-settings__wide">Details<textarea rows={2} value={item.description || ""} onChange={(event) => updateRow("education", index, "description", event.target.value)} /></label>
                </fieldset>
              ))}
            </section>
            {error && <p className="profile-settings__alert is-error" role="alert">{error}</p>}
            <div className="profile-settings__form-actions">
              <Link className="profile-settings__cancel" to="/profile/cv">Cancel</Link>
              <button className="profile-settings__save" type="submit" disabled={saving}>{saving ? "Saving…" : "Save CV"}</button>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}
