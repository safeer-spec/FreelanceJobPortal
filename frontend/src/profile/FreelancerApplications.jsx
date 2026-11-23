import { useEffect, useState } from "react";
import { getMyApplications, shareResumeWithClient, submitWork } from "../services/jobservices";
import "./fl.css";

export default function FreelancerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [openWorkId, setOpenWorkId] = useState("");
  const [drafts, setDrafts] = useState({});
  const [submittingId, setSubmittingId] = useState("");
  const [feedback, setFeedback] = useState({});
  const [sharingResumeId, setSharingResumeId] = useState("");
  const [resumeFeedback, setResumeFeedback] = useState({});

  async function handleShareResume(application) {
    setSharingResumeId(application._id);
    setResumeFeedback((current) => ({ ...current, [application._id]: "" }));
    try {
      const result = await shareResumeWithClient(application._id);
      setApplications((current) => current.map((item) =>
        item._id === application._id ? { ...item, ...result.application, job: item.job } : item,
      ));
      setResumeFeedback((current) => ({ ...current, [application._id]: result.message || "Your resume was sent to the client." }));
    } catch (requestError) {
      setResumeFeedback((current) => ({ ...current, [application._id]: requestError.message || "Could not share your resume." }));
    } finally {
      setSharingResumeId("");
    }
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMyApplications()
      .then((result) => {
        if (active) setApplications(Array.isArray(result) ? result : []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Could not load your applications.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshKey]);

  function setDraft(application, key, value) {
    setDrafts((current) => ({
      ...current,
      [application._id]: { ...(current[application._id] || {}), [key]: value },
    }));
  }

  async function handleSubmit(event, application) {
    event.preventDefault();
    setSubmittingId(application._id);
    setFeedback((current) => ({ ...current, [application._id]: "" }));
    const values = drafts[application._id] || {};
    try {
      const result = await submitWork(application._id, {
        submissionUrl: values.url ?? application.submissionUrl ?? "",
        submissionNote: values.note ?? application.submissionNote ?? "",
      });
      setApplications((current) => current.map((item) =>
        item._id === application._id
          ? { ...item, ...result.application, job: item.job }
          : item,
      ));
      setFeedback((current) => ({ ...current, [application._id]: result.message || "Work link shared with the client." }));
    } catch (requestError) {
      setFeedback((current) => ({ ...current, [application._id]: requestError.message || "Could not submit work." }));
    } finally {
      setSubmittingId("");
    }
  }

  const availableApplications = applications.filter((application) => Boolean(application.job));

  return (
    <section className="freelancer-applications" aria-labelledby="freelancer-applications-title">
      <div className="freelancer-applications__heading">
        <div>
          <p className="profile-layout__eyebrow">Your requests</p>
          <h2 id="freelancer-applications-title">My applications</h2>
        </div>
        <button type="button" onClick={() => { setError(""); setRefreshKey((current) => current + 1); }}>Refresh</button>
      </div>
      {loading && <p>Loading your applications…</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && availableApplications.length === 0 && <p>You have not applied to any jobs yet.</p>}
      <div className="freelancer-applications__grid">
        {availableApplications.map((application) => {
          const job = application.job;
          const isWorkOpen = openWorkId === application._id;
          const draft = drafts[application._id] || {};
          const canSubmitWork = Boolean(job && application.status === "approved" && job.status === "in-progress");

          return (
            <article className="freelancer-application" key={application._id}>
              <div className="freelancer-application__summary">
                <div>
                  <h3>{job?.title || "Job no longer available"}</h3>
                  {job?.category && <p>{job.category}</p>}
                </div>
                <span className={`freelancer-application__status is-${application.status}`}>{application.status}</span>
              </div>
              {job ? (
                <div className="freelancer-application__actions">
                  <button
                    className="freelancer-application__view"
                    type="button"
                    onClick={() => setOpenWorkId(isWorkOpen ? "" : application._id)}
                  >
                    {isWorkOpen ? "Hide work details" : application.status === "approved" ? "View approved work" : "View job details"}
                  </button>
                  {application.status !== "rejected" && (
                    <button className="freelancer-application__share-resume" type="button" disabled={sharingResumeId === application._id} onClick={() => handleShareResume(application)}>
                      {sharingResumeId === application._id ? "Sending resume…" : application.resumeSharedAt ? "Resend updated resume" : "Send resume to client"}
                    </button>
                  )}
                </div>
              ) : null}
              {resumeFeedback[application._id] && <p className="freelancer-application__resume-feedback" role="status">{resumeFeedback[application._id]}</p>}
              {isWorkOpen && job && (
                <div className="freelancer-application__details">
                  <h4>What to do</h4>
                  <p className="freelancer-application__description">{job.description || "The client has not added a detailed brief."}</p>
                  <div className="freelancer-application__facts">
                    {job.budget != null && <span>Budget: {job.budget}</span>}
                    {job.duration && <span>Duration: {job.duration}</span>}
                    {job.status && <span>Job status: {job.status}</span>}
                  </div>
                  {Array.isArray(job.skills) && job.skills.length > 0 && (
                    <p className="freelancer-application__skills"><strong>Skills:</strong> {job.skills.join(", ")}</p>
                  )}
                  {application.resumeSharedAt && <p className="freelancer-application__resume-sent">Resume sent to this client {new Date(application.resumeSharedAt).toLocaleDateString()}.</p>}
                  {canSubmitWork && (
                    <form className="freelancer-work-submit" onSubmit={(event) => handleSubmit(event, application)}>
                      <h4>Share your completed work</h4>
                      <label>
                        Work link
                        <input
                          type="url"
                          required
                          placeholder="https://drive.google.com/… or your live project"
                          value={draft.url ?? application.submissionUrl ?? ""}
                          onChange={(event) => setDraft(application, "url", event.target.value)}
                        />
                      </label>
                      <label>
                        Note to the client (optional)
                        <textarea
                          rows={3}
                          maxLength={2000}
                          placeholder="Tell the client what you completed or how to review it."
                          value={draft.note ?? application.submissionNote ?? ""}
                          onChange={(event) => setDraft(application, "note", event.target.value)}
                        />
                      </label>
                      {application.submittedAt && <p className="freelancer-work-submit__date">Last shared {new Date(application.submittedAt).toLocaleString()}</p>}
                      {feedback[application._id] && <p className="freelancer-work-submit__feedback" role="status">{feedback[application._id]}</p>}
                      <button type="submit" disabled={submittingId === application._id}>
                        {submittingId === application._id ? "Sending…" : application.submissionUrl ? "Update work link" : "Send work to client"}
                      </button>
                    </form>
                  )}
                  {application.status === "approved" && job.status !== "in-progress" && (
                    <p className="freelancer-application__unavailable">
                      {application.submissionUrl
                        ? `Your work link was shared${application.submittedAt ? ` on ${new Date(application.submittedAt).toLocaleDateString()}` : ""}. This job is ${job.status || "unavailable"}.`
                        : `This job is ${job.status || "unavailable"}, so work submission is closed.`}
                    </p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
