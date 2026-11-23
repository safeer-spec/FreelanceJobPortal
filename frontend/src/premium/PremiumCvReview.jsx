import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { getMyProfile } from "../services/profileservices.js";
import { reviewCvWithAi } from "../services/premiumCvService.js";
import "../profile/profileSettings.css";
import "./PremiumCvReview.css";

const EMPTY_EXPERIENCE = { title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" };
const EMPTY_EDUCATION = { school: "", degree: "", field: "", startDate: "", endDate: "", description: "" };

function readRole() {
  try { return JSON.parse(sessionStorage.getItem("jobportal.profile") || "null")?.role || null; }
  catch { return null; }
}

function profileToForm(profile = {}) {
  return {
    headline: profile.headline || "", location: profile.location || "", bio: profile.bio || "",
    portfolioUrl: profile.portfolioUrl || "", websiteUrl: profile.websiteUrl || "", linkedinUrl: profile.linkedinUrl || "",
    experience: Array.isArray(profile.experience) ? profile.experience.map((item) => ({ ...EMPTY_EXPERIENCE, ...item })) : [],
    education: Array.isArray(profile.education) ? profile.education.map((item) => ({ ...EMPTY_EDUCATION, ...item })) : [],
  };
}

function cvToText(cv, skillsText) {
  const sections = [];
  if (cv.headline.trim()) sections.push(`PROFESSIONAL HEADLINE\n${cv.headline.trim()}`);
  if (cv.bio.trim()) sections.push(`PROFESSIONAL SUMMARY\n${cv.bio.trim()}`);
  if (skillsText.trim()) sections.push(`SKILLS\n${skillsText.trim()}`);
  if (cv.experience.length) sections.push(`WORK EXPERIENCE\n${cv.experience.map((item) => [
    [item.title, item.company].filter(Boolean).join(" — "),
    [item.startDate, item.current ? "Present" : item.endDate].filter(Boolean).join(" to "), item.description,
  ].filter(Boolean).join("\n")).join("\n\n")}`);
  if (cv.education.length) sections.push(`EDUCATION\n${cv.education.map((item) => [
    [item.degree, item.field].filter(Boolean).join(" — "), item.school,
    [item.startDate, item.endDate].filter(Boolean).join(" to "), item.description,
  ].filter(Boolean).join("\n")).join("\n\n")}`);
  return sections.join("\n\n");
}


async function extractUploadedCv(file) {
  const extension = file.name.split(".").pop().toLowerCase();
  if (file.size > 8 * 1024 * 1024) throw new Error("Choose a CV smaller than 8 MB.");
  if (extension === "txt") return (await file.text()).slice(0, 10000);
  if (extension === "docx") {
    const mammothModule = await import("mammoth");
    const mammoth = mammothModule.default || mammothModule;
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return result.value.slice(0, 10000);
  }
  if (extension === "pdf") {
    const [pdfjs, worker] = await Promise.all([
      import("pdfjs-dist"),
      import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
    ]);
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    if (document.numPages > 30) throw new Error("Choose a CV with 30 pages or fewer.");
    const pages = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => item.str || "").join(" "));
    }
    return pages.join("\n").slice(0, 10000);
  }
  throw new Error("Choose a PDF, DOCX, or TXT CV file.");
}
const STOP_WORDS = new Set("about above after again against all also any are because been before being between both but can could did does doing down during each few for from further had has have having here how into its itself just more most other our out over same should some such than that the their them then there these they this those through under until very was were what when where which while with would your you role work experience skills ability strong using used looking required preferred team years candidate include including".split(" "));

function getKeywords(text) {
  const counts = new Map();
  for (const word of text.toLowerCase().match(/[a-z][a-z+#.-]{2,}/g) || []) {
    if (STOP_WORDS.has(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([word]) => word);
}

function screenCv(cvText, jobDescription) {
  const normalized = cvText.toLowerCase();
  const words = cvText.trim().split(/\s+/).filter(Boolean);
  const headings = ["experience", "skills", "education"].filter((heading) => new RegExp(`\\b${heading}\\b`, "i").test(cvText));
  const jobKeywords = getKeywords(jobDescription).slice(0, 18);
  const matched = jobKeywords.filter((word) => normalized.includes(word));
  const missing = jobKeywords.filter((word) => !normalized.includes(word)).slice(0, 8);
  const checks = [
    { label: "Clear experience, skills, and education sections", pass: headings.length >= 2, detail: `${headings.length} of 3 common sections found` },
    { label: "CV has enough detail to review", pass: words.length >= 120, detail: `${words.length} words (aim for at least 120)` },
    { label: "Uses measurable outcomes", pass: /\b\d+(?:\.\d+)?\s*(?:%|x|k|m|million|thousand|users|projects|hours|days|weeks|months|years)?\b/i.test(cvText), detail: "Add truthful numbers to show scope or impact" },
    { label: "Experience is easy to scan", pass: /(^|\n)\s*(?:[•*\-]|\d+[.)])\s/m.test(cvText), detail: "Use short bullet points for responsibilities and results" },
    { label: "Matches target role keywords", pass: jobKeywords.length === 0 || matched.length >= Math.min(4, jobKeywords.length), detail: jobKeywords.length ? `${matched.length} of ${jobKeywords.length} suggested terms appear` : "Add a target job description for a keyword comparison" },
  ];
  return { score: Math.round(checks.reduce((sum, check) => sum + (check.pass ? 20 : 0), 0)), checks, matched, missing };
}

export default function PremiumCvReview({ mode = "combined" }) {
  const role = readRole();
  const [cv, setCv] = useState(() => profileToForm());
  const [skillsText, setSkillsText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [targetCareer, setTargetCareer] = useState("");
  const [uploadedCvText, setUploadedCvText] = useState("");
  const [uploadedCvName, setUploadedCvName] = useState("");
  const [uploadingCv, setUploadingCv] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileMessage, setProfileMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [aiReview, setAiReview] = useState(null);
  const [ran, setRan] = useState(false);
  const cvText = useMemo(() => cvToText(cv, skillsText), [cv, skillsText]);
  const reviewCvText = mode === "ai" ? uploadedCvText : cvText;
  const reviewContext = useMemo(() => [targetCareer.trim() ? `Target career field: ${targetCareer.trim()}` : "", jobDescription].filter(Boolean).join("\n\n"), [targetCareer, jobDescription]);
  const atsResult = useMemo(() => ran ? screenCv(reviewCvText, reviewContext) : null, [reviewCvText, reviewContext, ran]);

  useEffect(() => {
    if (mode === "ai") { setLoading(false); return undefined; }
    let active = true;
    getMyProfile("freelancer")
      .then((profile) => {
        if (!active) return;
        setCv(profileToForm(profile));
        setSkillsText(Array.isArray(profile.skills) ? profile.skills.join(", ") : "");
        if (!profile.headline && !profile.bio && !profile.skills?.length && !profile.experience?.length && !profile.education?.length) {
          setProfileMessage("Your profile CV is empty. Fill in these sections or edit your saved CV first.");
        }
      })
      .catch((requestError) => { if (active) setProfileMessage(requestError.message || "Could not load your profile CV."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [mode]);

  if (role !== "freelancer") return <Navigate to="/login?role=freelancer" replace />;

  function setField(event) { setCv((current) => ({ ...current, [event.target.name]: event.target.value })); }
  function updateRow(listName, index, field, value) {
    setCv((current) => ({ ...current, [listName]: current[listName].map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row) }));
  }
  function addRow(listName, template) { setCv((current) => ({ ...current, [listName]: [...current[listName], { ...template }] })); }
  function removeRow(listName, index) { setCv((current) => ({ ...current, [listName]: current[listName].filter((_, rowIndex) => rowIndex !== index) })); }

  async function handleCvUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(""); setAiReview(null); setRan(false); setUploadingCv(true);
    try {
      const text = await extractUploadedCv(file);
      if (text.trim().length < 40) throw new Error("We could not find enough selectable text. Try a text based PDF or DOCX file.");
      setUploadedCvText(text); setUploadedCvName(file.name);
    } catch (uploadError) {
      setUploadedCvText(""); setUploadedCvName(""); setError(uploadError.message || "Could not read this CV file.");
    } finally { setUploadingCv(false); event.target.value = ""; }
  }

  async function analyze(event) {
    event.preventDefault();
    if (mode === "ai" && !uploadedCvText) { setError("Upload your CV before starting the AI review."); return; }
    if (reviewCvText.trim().length < 40) { setError("Add more CV details before running the review."); return; }
    setBusy(true); setError(""); setAiReview(null); setRan(mode !== "ai");
    if (mode !== "ats") {
      try { setAiReview(await reviewCvWithAi({ cvText: reviewCvText, jobDescription: reviewContext })); }
      catch (requestError) { setError(requestError.message || "AI review could not be completed."); }
    }
    setBusy(false);
  }

  return (
    <>
      <section className="ai-cv-hero" aria-labelledby="ai-cv-hero-title">
        <div className="ai-cv-hero__copy">
          <p className="ai-cv-hero__eyebrow"><span className="ai-cv-hero__eyebrow-dot" /> AI CV STUDIO</p>
          <h1 id="ai-cv-hero-title">Upload your CV. Get <span>career-ready.</span></h1>
          <p>Get feedback shaped around your target career field, plus practical next steps for your CV.</p>
          <div className="ai-cv-hero__features"><span><i /> Personalised CV feedback</span><span><i /> ATS readiness insights</span></div>
        </div>
        <div className="ai-cv-hero__visual" aria-hidden="true">
          <div className="ai-cv-hero__orbit ai-cv-hero__orbit--outer" />
          <div className="ai-cv-hero__orbit ai-cv-hero__orbit--inner" />
          <div className="ai-cv-hero__document">
            <div className="ai-cv-hero__document-top"><span>CV / PROFILE</span><span>01</span></div>
            <div className="ai-cv-hero__document-profile"><span className="ai-cv-hero__avatar" /><span><i className="ai-cv-hero__line ai-cv-hero__line--name" /><i className="ai-cv-hero__line ai-cv-hero__line--role" /></span></div>
            <div className="ai-cv-hero__document-section"><b>PROFILE SUMMARY</b><i /><i /><i className="short" /></div>
            <div className="ai-cv-hero__document-section"><b>EXPERIENCE</b><i /><i /><i className="short" /></div>
            <div className="ai-cv-hero__skills"><span>SKILLS</span><i /><i /><i /></div>
            <div className="ai-cv-hero__scan"><span>AI REVIEW IN PROGRESS</span></div>
          </div>
          <div className="ai-cv-hero__ai-chip"><span>&#10022;</span><b>AI</b><small>CV REVIEW</small></div>
          <div className="ai-cv-hero__score"><span className="ai-cv-hero__score-ring">92</span><span><b>ATS MATCH</b><small>Strong profile</small></span></div>
          <span className="ai-cv-hero__spark ai-cv-hero__spark--one">&#10022;</span>
          <span className="ai-cv-hero__spark ai-cv-hero__spark--two">&#10023;</span>
        </div>
      </section>
      <main className="profile-settings premium-cv-review">
      <Link className="premium-cv-review__back" to="/premium">← Back to Premium</Link>
      <header className="profile-settings__heading premium-cv-review__heading">
        <p className="premium-cv-review__eyebrow">PREMIUM CAREER TOOL</p>
        <h2>CV review studio</h2>
        <p>Shape your CV with an ATS readiness estimate and AI feedback for your next application.</p>
      </header>
      {profileMessage && <p className="profile-settings__message premium-cv-review__notice">{profileMessage}</p>}
      {loading ? <p className="profile-settings__message">Loading your profile CV…</p> : (
        <form className="profile-settings__form premium-cv-review__form" onSubmit={analyze}>
          {mode === "ai" ? <>
            <section className="profile-settings__section premium-cv-review__upload-card">
              <div className="premium-cv-review__upload-heading"><span className="premium-cv-review__step-number">01</span><div><p>START YOUR REVIEW</p><h2>Upload your CV</h2></div></div>
              <label className="profile-settings__wide">Target career field<input value={targetCareer} onChange={(event) => setTargetCareer(event.target.value)} maxLength={120} required placeholder="e.g. Product designer, data analyst, frontend developer" /></label>
              <label className={`premium-cv-review__dropzone${uploadedCvName ? " has-file" : ""}`} htmlFor="ai-cv-file">
                <input id="ai-cv-file" type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={handleCvUpload} disabled={uploadingCv} />
                <span className="premium-cv-review__upload-icon" aria-hidden="true">&#8593;</span>
                <strong>{uploadingCv ? "Reading your CV..." : uploadedCvName || "Choose a CV file"}</strong>
                <span>{uploadingCv ? "Extracting CV text in your browser" : "PDF, DOCX, or TXT. Maximum 8 MB."}</span>
                {!uploadingCv && <span className="premium-cv-review__browse">Browse files</span>}
              </label>
              <p className="premium-cv-review__privacy">Your file is read in this browser and is not saved. When you request feedback, extracted CV text is sent for AI analysis after email addresses and phone numbers are redacted. Remove other personal details before analysis.</p>
            </section>
            <section className="profile-settings__section premium-cv-review__job-section">
              <div className="premium-cv-review__upload-heading"><span className="premium-cv-review__step-number">02</span><div><p>PERSONALISE THE GUIDANCE</p><h2>What role are you aiming for?</h2></div></div>
              <label className="profile-settings__wide">Job description <span className="profile-settings__hint">Optional; adds role specific keyword feedback</span><textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} rows={5} maxLength={6000} placeholder="Paste a job description for more focused suggestions." /></label>
              {error && <p className="profile-settings__alert is-error" role="alert">{error}</p>}
              <div className="profile-settings__form-actions"><button className="profile-settings__save premium-cv-review__analyze" type="submit" disabled={busy || uploadingCv || !uploadedCvText}>{busy ? "Reviewing your CV..." : "Get AI career feedback"}</button></div>
            </section>
          </> : <>
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
          <section className="profile-settings__section premium-cv-review__job-section">
            <h2>Target job</h2>
            <label className="profile-settings__wide">Job description <span className="profile-settings__hint">Optional; improves keyword matching and AI feedback</span><textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} rows={5} maxLength={6000} placeholder="Paste the job description you want to apply for." /></label>
            {mode !== "ats" && <p className="premium-cv-review__privacy">When you select Analyze, CV content and the optional job description are sent to OpenAI for feedback. Email addresses and phone numbers are redacted first. Remove other personal details before analysis.</p>}
            {error && <p className="profile-settings__alert is-error" role="alert">{error}</p>}
            <div className="profile-settings__form-actions"><button className="profile-settings__save" type="submit" disabled={busy}>{busy ? "Reviewing your CV…" : mode === "ats" ? "Run ATS screen" : mode === "ai" ? "Get AI career feedback" : "Analyze CV with ATS + AI"}</button><Link className="profile-settings__cancel" to="/profile/cv/edit">Edit saved CV</Link></div>
          </section>
          </>}
        </form>
      )}
      {atsResult && mode !== "ai" && <section className="profile-settings__section premium-cv-review__results" aria-live="polite">
        <div className="premium-cv-review__section-title"><div><span>ATS REVIEW</span><h2>ATS readiness estimate</h2></div><strong>{atsResult.score}<small>/100</small></strong></div>
        <p className="premium-cv-review__disclaimer">A practical formatting and keyword estimate—not a score from an employer’s ATS.</p>
        {jobDescription && <div className="premium-cv-review__keywords"><div><h3>Keywords found</h3><p>{atsResult.matched.length ? atsResult.matched.join(" · ") : "No target keywords found yet."}</p></div><div><h3>Consider adding, if accurate</h3><p>{atsResult.missing.length ? atsResult.missing.join(" · ") : "No major keyword gaps from this quick comparison."}</p></div></div>}
        <ul className="premium-cv-review__checks">{atsResult.checks.map((check) => <li key={check.label} className={check.pass ? "is-pass" : "is-review"}><span aria-hidden="true">{check.pass ? "✓" : "•"}</span><div><strong>{check.label}</strong><p>{check.detail}</p></div></li>)}</ul>
      </section>}
      {aiReview && mode !== "ats" && <section className="profile-settings__section premium-cv-review__results premium-cv-review__ai" aria-live="polite">
        <div className="premium-cv-review__section-title"><div><span>AI REVIEW</span><h2>Career feedback</h2></div><span className="premium-cv-review__ai-badge">AI</span></div>
        <p className="premium-cv-review__summary">{aiReview.summary}</p>
        <div className="premium-cv-review__ai-grid"><ReviewList title="What’s working" items={aiReview.strengths} /><ReviewList title="Priority improvements" items={aiReview.improvements} /><ReviewList title="Role keyword gaps" items={aiReview.keywordGaps} /></div>
        {aiReview.rewrittenBullets?.length > 0 && <div className="premium-cv-review__rewrites"><h3>Example CV bullet rewrites</h3><ul>{aiReview.rewrittenBullets.map((item, index) => <li key={`${item.original}-${index}`}><p><strong>Current</strong>{item.original}</p><p><strong>Suggested</strong>{item.suggested}</p></li>)}</ul></div>}
        <p className="premium-cv-review__disclaimer">Treat AI suggestions as drafts. Keep every detail accurate and only include skills or results you can support.</p>
      </section>}
    </main>
    </>
  );
}

function ReviewList({ title, items = [] }) {
  return <section className="premium-cv-review__list"><h3>{title}</h3>{items.length ? <ul>{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p>No items returned for this section.</p>}</section>;
}
