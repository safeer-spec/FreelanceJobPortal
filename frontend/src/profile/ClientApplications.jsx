import { useCallback, useEffect, useState } from "react";
import { getClientApplications, postClientReview, reviewApplication } from "../services/jobservices";

export default function ClientApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [reviewBusyId, setReviewBusyId] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getClientApplications();
      setApplications(Array.isArray(result) ? result : []);
    } catch (requestError) {
      setError(requestError.message || "Could not load applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function handleReview(applicationId, status) {
    setBusyId(applicationId);
    setError("");
    try {
      await reviewApplication(applicationId, status);
      const reviewedApplication = applications.find((item) => item._id === applicationId);
      const reviewedJobId = String(reviewedApplication?.job?._id || reviewedApplication?.job || "");
      setApplications((current) => current.map((application) => {
        const sameJob = String(application.job?._id || application.job || "") === reviewedJobId;
        if (application._id === applicationId) return { ...application, status };
        if (status === "approved" && sameJob) {
          return { ...application, job: { ...application.job, status: "in-progress" } };
        }
        return application;
      }));
      window.dispatchEvent(new Event("jobportal:applications-updated"));
      if (status === "approved") window.dispatchEvent(new Event("jobportal:jobs-updated"));
    } catch (requestError) {
      setError(requestError.message || "Could not update this application.");
    } finally {
      setBusyId("");
    }
  }

  async function handlePostReview(event, application) {
    event.preventDefault();
    const draft = reviewDrafts[application._id] || {};
    setReviewBusyId(application._id);
    setError("");
    try {
      const result = await postClientReview(application._id, {
        rating: Number(draft.rating || 5),
        comment: draft.comment || "",
      });
      setApplications((current) => current.map((item) =>
        item._id === application._id ? { ...item, ...result.application } : item,
      ));
    } catch (requestError) {
      setError(requestError.message || "Could not post the review.");
    } finally {
      setReviewBusyId("");
    }
  }

  return (
    <section className="client-applications" aria-labelledby="client-applications-title">
      <div className="client-applications__heading">
        <div>
          <p className="client-job-create__eyebrow">Freelancer responses</p>
          <h2 id="client-applications-title">Job applications</h2>
        </div>
        <button type="button" className="client-applications__refresh" onClick={refresh} disabled={loading}>
          <span className={loading ? "client-applications__refresh-icon is-spinning" : "client-applications__refresh-icon"} aria-hidden="true">↻</span>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      {error && <p className="client-job-form__message is-error" role="alert">{error}</p>}
      {loading && <p className="client-applications__empty">Loading applications…</p>}
      {!loading && !error && applications.length === 0 && (
        <p className="client-applications__empty">No applications yet. Freelancer requests for your jobs will appear here.</p>
      )}
      <div className="client-applications__list">
        {applications.map((application) => {
          const freelancer = application.freelancer;
          const job = application.job;
          const resume = application.resumeSnapshot;
          const hasSharedResume = Boolean(application.resumeSharedAt && resume);
          const isExpanded = expandedId === application._id;
          return (
            <article className="client-application" key={application._id}>
              <div className="client-application__main">
                <div className="client-application__identity">
                  <span className="client-application__avatar" aria-hidden="true">
                    {freelancer?.profilePhoto
                      ? <img src={freelancer.profilePhoto} alt="" />
                      : (freelancer?.name || "F").trim().charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <h3>{freelancer?.name || "Freelancer"}</h3>
                    <p>Applied for <strong>{job?.title || "Removed job"}</strong></p>
                    <span className={`client-application__status is-${application.status}`}>{application.status}</span>
                  </div>
                </div>
                <div className="client-application__actions">
                  <button type="button" className="client-applications__refresh" onClick={() => setExpandedId(isExpanded ? "" : application._id)}>
                    {isExpanded ? "Hide profile" : hasSharedResume ? "View resume" : "View profile"}
                  </button>
                  {application.status === "pending" && (
                    <>
                      <button type="button" className="client-application__approve" disabled={busyId === application._id || job?.status !== "open"} onClick={() => handleReview(application._id, "approved")}>
                        {busyId === application._id ? "Saving…" : "Approve"}
                      </button>
                      <button type="button" className="client-application__reject" disabled={busyId === application._id} onClick={() => handleReview(application._id, "rejected")}>
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
              {(application.bidAmount != null || application.applicationNote) && (
                <div className="client-application__delivery">
                  <h4>Freelancer’s proposal</h4>
                  {application.bidAmount != null && <p><strong>Bid:</strong> {new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(application.bidAmount)}</p>}
                  {application.applicationNote && <p>{application.applicationNote}</p>}
                </div>
              )}
              {application.submissionUrl && (
                <div className="client-application__delivery">
                  <h4>Work submitted</h4>
                  <a href={application.submissionUrl} target="_blank" rel="noreferrer">Open freelancer’s work</a>
                  {application.submissionNote && <p>{application.submissionNote}</p>}
                  {application.submittedAt && <small>Shared {new Date(application.submittedAt).toLocaleString()}</small>}
                </div>
              )}
              {application.review?.client ? (
                <div className="client-application__review">
                  <div className="client-application__review-heading">
                    <h4>Your review</h4>
                    <span aria-label={`${application.review.rating} out of 5 stars`}>{"★".repeat(application.review.rating || 0)}{"☆".repeat(5 - (application.review.rating || 0))}</span>
                  </div>
                  <p>{application.review.comment}</p>
                  <small>Posted as {application.review.client.name || "the signed-in client"}{application.review.createdAt ? ` · ${new Date(application.review.createdAt).toLocaleDateString()}` : ""}</small>
                </div>
              ) : application.status === "approved" && application.submissionUrl ? (
                <form className="client-review-form" onSubmit={(event) => handlePostReview(event, application)}>
                  <h4>Review this freelancer’s work</h4>
                  <label>Rating
                    <select value={reviewDrafts[application._id]?.rating || "5"} onChange={(event) => setReviewDrafts((current) => ({ ...current, [application._id]: { ...current[application._id], rating: event.target.value } }))}>
                      {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} {rating === 1 ? "star" : "stars"}</option>)}
                    </select>
                  </label>
                  <label>Your review
                    <textarea required minLength="1" maxLength="2000" rows="3" placeholder="How was your experience working with this freelancer?" value={reviewDrafts[application._id]?.comment || ""} onChange={(event) => setReviewDrafts((current) => ({ ...current, [application._id]: { ...current[application._id], comment: event.target.value } }))} />
                  </label>
                  <button type="submit" disabled={reviewBusyId === application._id}>{reviewBusyId === application._id ? "Posting…" : "Post review"}</button>
                </form>
              ) : null}
              {isExpanded && (
                <div className="client-application__profile">
                  <div className="client-application__profile-heading">
                    <span className="client-application__profile-photo">
                      {resume?.profilePhoto || freelancer?.profilePhoto
                        ? <img src={resume?.profilePhoto || freelancer.profilePhoto} alt="" />
                        : (freelancer?.name || "F").trim().charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <h4>{resume?.name || freelancer?.name || "Freelancer profile"}</h4>
                      {hasSharedResume && resume.headline && <p>{resume.headline}</p>}
                      {hasSharedResume && resume.location && <p>{resume.location}</p>}
                    </div>
                  </div>
                  {application.resumeSharedAt && <p className="client-application__resume-shared">Resume shared {new Date(application.resumeSharedAt).toLocaleDateString()}</p>}
                  <dl>
                    <div><dt>Name</dt><dd>{resume?.name || freelancer?.name || "Not provided"}</dd></div>
                    {hasSharedResume && <div><dt>Email</dt><dd>{resume.email || "Not provided"}</dd></div>}
                    {hasSharedResume && <div><dt>Phone</dt><dd>{resume.phone || "Not provided"}</dd></div>}
                    <div><dt>Applied for</dt><dd>{job?.title || "Removed job"}</dd></div>
                    <div><dt>Applied</dt><dd>{new Date(application.createdAt).toLocaleDateString()}</dd></div>
                    {hasSharedResume && resume.location && <div><dt>Location</dt><dd>{resume.location}</dd></div>}
                    {hasSharedResume && resume.bio && <div className="client-application__profile-bio"><dt>About</dt><dd>{resume.bio}</dd></div>}
                    {hasSharedResume && resume.skills?.length > 0 && <div className="client-application__profile-skills"><dt>Skills</dt><dd>{resume.skills.join(", ")}</dd></div>}
                    {hasSharedResume && resume.portfolioUrl && <div><dt>Portfolio</dt><dd><a href={resume.portfolioUrl} target="_blank" rel="noreferrer">Open portfolio</a></dd></div>}
                    {hasSharedResume && resume.websiteUrl && <div><dt>Website</dt><dd><a href={resume.websiteUrl} target="_blank" rel="noreferrer">Open website</a></dd></div>}
                    {hasSharedResume && resume.linkedinUrl && <div><dt>LinkedIn</dt><dd><a href={resume.linkedinUrl} target="_blank" rel="noreferrer">Open LinkedIn</a></dd></div>}
                  </dl>
                  {hasSharedResume && resume.experience?.length > 0 && (
                    <div className="client-application__profile-list">
                      <h5>Work experience</h5>
                      {resume.experience.map((item, index) => (
                        <article key={item._id || index}>
                          <strong>{item.title || "Experience"}</strong>
                          {(item.company || item.location) && <p>{[item.company, item.location].filter(Boolean).join(" · ")}</p>}
                          {(item.startDate || item.endDate || item.current) && <p>{item.startDate || ""} – {item.current ? "Present" : (item.endDate || "")}</p>}
                          {item.description && <p>{item.description}</p>}
                        </article>
                      ))}
                    </div>
                  )}
                  {hasSharedResume && resume.education?.length > 0 && (
                    <div className="client-application__profile-list">
                      <h5>Education</h5>
                      {resume.education.map((item, index) => (
                        <article key={item._id || index}>
                          <strong>{item.school || "Education"}</strong>
                          {(item.degree || item.field) && <p>{[item.degree, item.field].filter(Boolean).join(" · ")}</p>}
                          {(item.startDate || item.endDate) && <p>{item.startDate || ""} – {item.endDate || ""}</p>}
                          {item.description && <p>{item.description}</p>}
                        </article>
                      ))}
                    </div>
                  )}
                  {!hasSharedResume && <p className="client-application__resume-private">This freelancer has not shared their resume yet. Only their name and profile photo are visible.</p>}
                  {job?.status !== "open" && application.status === "pending" && <p>This job is no longer open for approval.</p>}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
