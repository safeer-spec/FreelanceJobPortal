import { useEffect, useState } from "react";
import { getPremiumSupportInbox, replyToPremiumSupportRequest } from "../services/premiumSupportService.js";
import "../premium/PremiumFeaturePages.css";

export default function PremiumSupportInbox() {
  const [requests, setRequests] = useState([]);
  const [replies, setReplies] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  async function refresh() {
    try { const result = await getPremiumSupportInbox(); setRequests(result.requests || []); }
    catch (requestError) { setError(requestError.message || "Could not load the Premium inbox."); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);
  async function submitReply(event, id) {
    event.preventDefault(); setSaving(id); setError("");
    try { await replyToPremiumSupportRequest(id, replies[id] || ""); setReplies((current) => ({ ...current, [id]: "" })); await refresh(); }
    catch (requestError) { setError(requestError.message || "Could not save the reply."); }
    finally { setSaving(""); }
  }
  return <section className="premium-feature-page__admin-inbox"><h2>Premium career support requests</h2>{error && <p role="alert">{error}</p>}{loading ? <p>Loading inbox…</p> : requests.length ? requests.map((request) => <article className="premium-feature-page__request" key={request._id}><div className="premium-feature-page__request-heading"><div><span>{request.freelancer?.name || "Freelancer"} · {request.freelancer?.email || ""} · {request.category}</span><h3>{request.subject}</h3></div><span className={`premium-feature-page__status is-${request.status}`}>{request.status}</span></div><p>{request.message}</p>{request.adminReply && <div className="premium-feature-page__reply"><strong>Current reply</strong><p>{request.adminReply}</p></div>}<form className="premium-feature-page__reply-form" onSubmit={(event) => submitReply(event, request._id)}><label>Reply<textarea rows={3} value={replies[request._id] ?? request.adminReply ?? ""} onChange={(event) => setReplies((current) => ({ ...current, [request._id]: event.target.value }))} maxLength={3000} required /></label><button type="submit" disabled={saving === request._id}>{saving === request._id ? "Saving…" : "Send reply"}</button></form></article>) : <p>No Premium support requests yet.</p>}</section>;
}
