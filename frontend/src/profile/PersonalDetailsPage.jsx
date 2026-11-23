import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { getMyProfile, updateMyProfile } from "../services/profileservices";
import "./profileSettings.css";

function readAccount() {
  try { return JSON.parse(sessionStorage.getItem("jobportal.profile") || "null"); }
  catch { return null; }
}

function splitName(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts.shift() || "", lastName: parts.join(" ") };
}

export default function PersonalDetailsPage() {
  const [account] = useState(readAccount);
  const role = account?.role;
  const [fields, setFields] = useState(() => ({ ...splitName(account?.name), email: account?.email || "", phone: account?.phone == null ? "" : String(account.phone) }));
  const [photo, setPhoto] = useState(account?.profilePhoto || "");
  const [loading, setLoading] = useState(Boolean(role));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!role) return undefined;
    let active = true;
    getMyProfile(role)
      .then((data) => {
        if (!active) return;
        setFields({ ...splitName(data.name), email: data.email || "", phone: data.phone == null ? "" : String(data.phone) });
        setPhoto(data.profilePhoto || "");
        sessionStorage.setItem("jobportal.profile", JSON.stringify({ ...data, role }));
      })
      .catch((requestError) => { if (active) setError(requestError.message || "Could not load your details."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [role]);

  if (!role) return <Navigate to="/login" replace />;

  function setField(event) {
    setFields((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function choosePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 2 * 1024 * 1024) {
      setError("Choose a PNG, JPEG, or WebP image smaller than 2 MB.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setPhoto(String(reader.result || "")); setError(""); };
    reader.onerror = () => setError("Could not read that photo. Choose another file.");
    reader.readAsDataURL(file);
  }

  async function saveDetails(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await updateMyProfile(role, {
        name: `${fields.firstName.trim()} ${fields.lastName.trim()}`.trim(),
        email: fields.email.trim(),
        phone: fields.phone.trim(),
        profilePhoto: photo,
      });
      sessionStorage.setItem("jobportal.profile", JSON.stringify({ ...result.profile, role }));
      window.dispatchEvent(new Event("jobportal:profile-updated"));
      setNotice("Personal details saved.");
    } catch (requestError) {
      setError(requestError.message || "Could not save your details.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="profile-settings">
        <header className="profile-settings__heading">
          <p className="profile-layout__eyebrow">Your account</p>
          <h1>Edit personal details</h1>
          <p>These details are saved to your account. Your CV information stays separate.</p>
        </header>
        {loading ? <p className="profile-settings__message">Loading your details…</p> : (
          <form className="profile-settings__form profile-settings__details-form" onSubmit={saveDetails}>
            <section className="profile-settings__photo-section">
              <div className="profile-settings__photo">
                {photo ? <img src={photo} alt="Your profile" /> : <span>{(fields.firstName || "U").charAt(0).toUpperCase()}</span>}
              </div>
              <div>
                <h2>Profile photo</h2>
                <p>Use a PNG, JPEG, or WebP image up to 2 MB.</p>
                <label className="profile-settings__upload">Choose photo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={choosePhoto} /></label>
                {photo && <button className="profile-settings__text-button" type="button" onClick={() => setPhoto("")}>Remove photo</button>}
              </div>
            </section>
            <section className="profile-settings__section">
              <h2>Personal details</h2>
              <div className="profile-settings__grid">
                <label>First name<input name="firstName" value={fields.firstName} onChange={setField} autoComplete="given-name" required /></label>
                <label>Last name<input name="lastName" value={fields.lastName} onChange={setField} autoComplete="family-name" required /></label>
                <label>Email<input name="email" type="email" value={fields.email} onChange={setField} autoComplete="email" required /></label>
                <label>Phone<input name="phone" type="tel" value={fields.phone} onChange={setField} autoComplete="tel" required /></label>
              </div>
            </section>
            {error && <p className="profile-settings__alert is-error" role="alert">{error}</p>}
            {notice && <p className="profile-settings__alert is-success" role="status">{notice}</p>}
            <div className="profile-settings__form-actions">
              <Link className="profile-settings__cancel" to="/profile">Back to profile</Link>
              <button className="profile-settings__save" type="submit" disabled={saving}>{saving ? "Saving…" : "Save details"}</button>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}
