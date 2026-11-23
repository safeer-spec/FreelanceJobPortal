import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProfile } from "../services/profileservices.js";
import "./PremiumFeaturePages.css";

const STARTER_STEPS = [
  { title: "Choose a target role", detail: "Pick one role to focus your CV, learning plan, and applications.", phase: "Focus" },
  { title: "Compare your skills with job requirements", detail: "Review three suitable openings and note repeated skills you already have and gaps to close.", phase: "Prepare" },
  { title: "Strengthen your CV", detail: "Use the ATS screen, update your experience bullets, and save a clean version of your CV.", phase: "Prepare" },
  { title: "Build proof of your skills", detail: "Complete a portfolio project or case study that demonstrates a relevant skill.", phase: "Build" },
  { title: "Practice interviews", detail: "Prepare examples of your work and rehearse concise answers for the target role.", phase: "Apply" },
  { title: "Apply and review progress weekly", detail: "Track applications, follow up, and adjust the plan based on responses.", phase: "Apply" },
];
function readAccount() { try { return JSON.parse(sessionStorage.getItem("jobportal.profile") || "null"); } catch { return null; } }
export default function PremiumRoadmap() {
  const account = readAccount();
  const storageKey = "jobportal.premium-roadmap." + (account?.email || "freelancer");
  const [targetRole, setTargetRole] = useState("");
  const [steps, setSteps] = useState(STARTER_STEPS);
  const [custom, setCustom] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editDraft, setEditDraft] = useState({ title: "", detail: "" });
  const [loaded, setLoaded] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [roleDraft, setRoleDraft] = useState("");
  useEffect(() => {
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem(storageKey) || "null"); } catch { stored = null; }
    if (stored) { setTargetRole(stored.targetRole || ""); setSteps(stored.steps || STARTER_STEPS); }
    getMyProfile("freelancer").then((profile) => { if (!stored) setTargetRole(profile.headline || ""); }).catch(() => {}).finally(() => setLoaded(true));
  }, [storageKey]);
  useEffect(() => { if (loaded) localStorage.setItem(storageKey, JSON.stringify({ targetRole, steps })); }, [loaded, storageKey, targetRole, steps]);
  const completed = steps.filter((step) => step.done).length;
  const progress = useMemo(() => steps.length ? Math.round(completed / steps.length * 100) : 0, [completed, steps.length]);
  function toggle(index) { setSteps((current) => current.map((step, i) => i === index ? { ...step, done: !step.done } : step)); }
  function addStep(event) {
    event.preventDefault();
    if (!custom.trim()) return;
    setSteps((current) => [...current, { id: Date.now() + "-" + Math.random().toString(36).slice(2), custom: true, title: custom.trim(), detail: "Your custom milestone", phase: "My actions", done: false }]);
    setCustom("");
  }
  function beginEdit(index, step) { setEditingIndex(index); setEditDraft({ title: step.title, detail: step.detail || "" }); }
  function saveEdit(event, index) {
    event.preventDefault();
    if (!editDraft.title.trim()) return;
    setSteps((current) => current.map((step, i) => i === index ? { ...step, title: editDraft.title.trim(), detail: editDraft.detail.trim() } : step));
    setEditingIndex(null);
  }
  function deleteStep(index) {
    setSteps((current) => current.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  }
  return <main className="profile-settings premium-feature-page premium-roadmap-page">
    <section className="premium-roadmap-welcome"><div className="premium-roadmap-welcome__copy"><span className="premium-roadmap-welcome__tag">YOUR NEXT CHAPTER</span><h1>Build a path that moves you forward.</h1><p>Set your goal, track the steps that matter, and shape the plan around the career you want.</p><div className="premium-roadmap-welcome__pills"><span><b>01</b> Set your direction</span><span><b>02</b> Make steady progress</span><span><b>03</b> Reach your next role</span></div></div><div className="premium-roadmap-welcome__art" aria-hidden="true"><span className="premium-roadmap-welcome__orbit"></span><span className="premium-roadmap-welcome__star">✦</span><span className="premium-roadmap-welcome__path">↗</span><span className="premium-roadmap-welcome__dot"></span></div></section><Link className="premium-feature-page__back" to="/premium">← Back to Premium</Link>
    <header className="profile-settings__heading"><p className="premium-feature-page__eyebrow">PREMIUM ROADMAP</p><h1>Your path to the next role</h1><p>Turn your career goal into steps you can take and track. Your progress is saved in this browser.</p></header>
    <section className="profile-settings__section premium-roadmap-role"><div className="premium-roadmap-role__heading"><div><p className="premium-feature-page__eyebrow">YOUR CAREER FOCUS</p><h2>Target role</h2><p>Shape your roadmap around the role you want next.</p></div><span className="premium-roadmap-role__spark" aria-hidden="true">✦</span></div>{isEditingRole ? <form className="premium-roadmap-role__editor" onSubmit={(event) => { event.preventDefault(); setTargetRole(roleDraft.trim()); setIsEditingRole(false); }}><label htmlFor="premium-target-role">Role you want to pursue</label><input id="premium-target-role" autoFocus value={roleDraft} onChange={(event) => setRoleDraft(event.target.value)} placeholder="e.g. Product designer" maxLength={120} /><div className="premium-roadmap-role__actions"><button type="button" className="is-secondary" onClick={() => setIsEditingRole(false)}>Cancel</button><button type="submit" disabled={!roleDraft.trim()}>Save role</button></div></form> : <div className="premium-roadmap-role__current"><strong>{targetRole || "Choose the role you want next"}</strong><button type="button" onClick={() => { setRoleDraft(targetRole); setIsEditingRole(true); }}>{targetRole ? "Change role" : "Choose a role"}</button></div>}<div className="premium-feature-page__progress"><div><strong>{progress}% complete</strong><span>{completed} of {steps.length} steps</span></div><progress value={progress} max="100" /></div></section>
    <section className="profile-settings__section"><h2>Roadmap milestones</h2><div className="premium-feature-page__steps">{steps.map((step, index) => {
      const isCustom = Boolean(step.custom || step.phase === "My actions");
      return <article className="premium-feature-page__step-card" key={step.id || step.title + index}>
        <label className={"premium-feature-page__step" + (step.done ? " is-done" : "")}><input type="checkbox" checked={Boolean(step.done)} onChange={() => toggle(index)} /><span><small>{step.phase}</small><strong>{step.title}</strong><span>{step.detail}</span></span></label>
        {isCustom && (editingIndex === index
          ? <form className="premium-feature-page__step-edit" onSubmit={(event) => saveEdit(event, index)}>
              <label>Milestone title<input value={editDraft.title} onChange={(event) => setEditDraft((draft) => ({ ...draft, title: event.target.value }))} maxLength={160} required /></label>
              <label>Description<textarea value={editDraft.detail} onChange={(event) => setEditDraft((draft) => ({ ...draft, detail: event.target.value }))} maxLength={500} rows={3} /></label>
              <div className="premium-feature-page__step-actions"><button type="button" onClick={() => setEditingIndex(null)}>Cancel</button><button type="submit">Save</button></div>
            </form>
          : <div className="premium-feature-page__step-actions"><button type="button" onClick={() => beginEdit(index, step)} aria-label={"Edit " + step.title}>Edit</button><button className="is-delete" type="button" onClick={() => deleteStep(index)} aria-label={"Delete " + step.title}>Delete</button></div>)}
      </article>;
    })}</div><form className="premium-feature-page__add-step" onSubmit={addStep}><label>Add a milestone<input value={custom} onChange={(event) => setCustom(event.target.value)} maxLength={160} placeholder="Add a step for your plan" /></label><button type="submit">Add step</button></form><p className="premium-feature-page__footnote">Want a person to review your plan? <Link to="/premium/admin-connection">Send a request to the admin team</Link>.</p></section>
  </main>;
}