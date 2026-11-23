import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyPremiumSupportRequests, submitPremiumSupportRequest } from "../services/premiumSupportService.js";
import "./PremiumFeaturePages.css";

export default function PremiumSupportPage() {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ category: "Career plan", subject: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadRequests() {
    try { const result = await getMyPremiumSupportRequests(); setRequests(result.requests || []); }
    catch (requestError) { setError(requestError.message || "Could not load your requests."); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadRequests(); }, []);

  async function submit(event) {
    event.preventDefault(); setSending(true); setError(""); setNotice("");
    try {
      await submitPremiumSupportRequest(form);
      setForm({ category: "Career plan", subject: "", message: "" });
      setNotice("Your request has been sent to the admin team.");
      await loadRequests();
    } catch (requestError) { setError(requestError.message || "Could not send your request."); }
    finally { setSending(false); }
  }

  return <>
    <section className="premium-support-hero" aria-labelledby="premium-support-hero-title">
      <div className="premium-support-hero__copy">
        <p className="premium-support-hero__eyebrow"><span /> PREMIUM CAREER SUPPORT</p>
        <h1 id="premium-support-hero-title">A clearer next step starts with a conversation.</h1>
        <p>Share a career question, get help with your Premium tools, and keep every reply in one place.</p>
        <div className="premium-support-hero__topics"><span>Career guidance</span><span>CV and interview</span><span>Premium help</span></div>
      </div>
      <div className="premium-support-hero__visual" aria-hidden="true">
        <div className="premium-support-hero__orbit" />
        <div className="premium-support-hero__chat premium-support-hero__chat--back"><span className="premium-support-hero__avatar">A</span><span><i /><i /><i /></span></div>
        <div className="premium-support-hero__chat premium-support-hero__chat--front"><b>YOUR QUESTION</b><i /><i className="short" /><span className="premium-support-hero__reply">We can help you plan your next move.</span></div>
        <div className="premium-support-hero__badge"><span>&#10022;</span><b>ADMIN</b><small>CONNECTION</small></div>
        <span className="premium-support-hero__spark premium-support-hero__spark--one">&#10023;</span>
        <span className="premium-support-hero__spark premium-support-hero__spark--two">&#10022;</span>
      </div>
    </section>
    <main className="profile-settings premium-feature-page premium-support-page">
    <Link className="premium-feature-page__back" to="/premium">← Back to Premium</Link>
    <header className="profile-settings__heading"><p className="premium-feature-page__eyebrow">PREMIUM SUPPORT</p><h1>Connect with the admin team</h1><p>Send your career question or ask for help shaping your next step. Your requests and any replies appear here.</p></header>
    <form className="profile-settings__form" onSubmit={submit}>
      <section className="profile-settings__section">
        <h2>New support request</h2>
        <div className="profile-settings__grid">
          <label>Topic<select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}><option>Career plan</option><option>CV or interview</option><option>Job opportunity</option><option>Account or Premium</option><option>Other</option></select></label>
          <label>Subject<input value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} maxLength={120} required placeholder="What would you like help with?" /></label>
        </div>
        <label className="profile-settings__wide">Message<textarea rows={6} value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} maxLength={3000} required placeholder="Share your target roles, experience, and the question you want to discuss." /></label>
        {error && <p className="profile-settings__alert is-error" role="alert">{error}</p>}
        {notice && <p className="profile-settings__alert is-success" role="status">{notice}</p>}
        <button className="profile-settings__save" type="submit" disabled={sending}>{sending ? "Sending…" : "Send to admin team"}</button>
      </section>
    </form>
    <section className="premium-feature-page__history"><h2>Your requests</h2>{loading ? <p>Loading requests…</p> : requests.length ? requests.map((request) => <article className="premium-feature-page__request" key={request._id}><div className="premium-feature-page__request-heading"><div><span>{request.category}</span><h3>{request.subject}</h3></div><span className={`premium-feature-page__status is-${request.status}`}>{request.status}</span></div><p>{request.message}</p><small>{new Date(request.createdAt).toLocaleDateString()}</small>{request.adminReply && <div className="premium-feature-page__reply"><strong>Admin reply</strong><p>{request.adminReply}</p></div>}</article>) : <p>No requests yet. Send your first question above.</p>}</section>
    </main>
  </>;
}
