import { API_BASE_URL as API_BASE } from "../services/apiBase.js";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  adminWorkImage,
  creativeWorkImage,
  developmentWorkImage,
  officeWorkImage,
  categories,
  jobs as sampleJobs,
} from "../Mainp.jsx/jobs";
import "./jobListings.css";
import { applyToJob, updateMyApplication, deleteAdminJob, deleteClientJob, getMyApplications, reviewJob, suggestJobEdit, updateJob } from "../services/jobservices";
import { getLikedJobs, jobFavoriteKey, LIKED_JOBS_EVENT, toggleLikedJob } from "../services/likedJobs";



const JOB_ENDPOINTS = {
  public: "/job/list",
  client: "/job/my-jobs",
  freelancer: "/job/list",
  admin: "/job/admin/list",
};

const CATEGORY_IMAGES = {
  "Development & IT": developmentWorkImage,
  "Design & Creative": creativeWorkImage,
  "Finance & Accounting": officeWorkImage,
  "Admin & Customer Support": officeWorkImage,
  "Sales & Marketing": adminWorkImage,
};

function getSignedInRole() {
  try {
    const profile = JSON.parse(sessionStorage.getItem("jobportal.profile") || "null");
    return ["admin", "client", "freelancer"].includes(profile?.role)
      ? profile.role
      : null;
  } catch {
    return null;
  }
}

function normalizeCategory(category) {
  const value = (category || "").trim().toLowerCase();
  if (["web development", "web dev", "development", "it"].includes(value)) {
    return "development & it";
  }
  return value;
}

function combineFeaturedAndLiveJobs(liveJobs) {
  const jobsByTitle = new Map(
    sampleJobs.map((job, index) => [
      (job.title || "featured-" + index).trim().toLowerCase(),
      job,
    ]),
  );
  liveJobs.forEach((job, index) => {
    const key = (job.title || "live-" + index).trim().toLowerCase();
    jobsByTitle.set(key, job);
  });
  return [...jobsByTitle.values()];
}

function formatBudget(job) {
  if (job.budget === undefined || job.budget === null || job.budget === "") {
    return "";
  }
  const type = job.budgetType === "hourly" ? " / hour" : "";
  return "Budget: " + job.budget + type;
}

export default function JobListings({ role = "public" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchTerm = (searchParams.get("search") || "").trim().toLowerCase();
  const signedInRole = role === "public" ? getSignedInRole() : role;
  const requestRole = signedInRole || "public";
  const isGuest = !signedInRole;
  const [activeCategory, setActiveCategory] = useState("Any type of work");
  const [listings, setListings] = useState([]);
  const [usingSamples, setUsingSamples] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [applicationStatuses, setApplicationStatuses] = useState({});
  const [applicationsByJob, setApplicationsByJob] = useState({});
  const [applicationFormJob, setApplicationFormJob] = useState(null);
  const [savingApplication, setSavingApplication] = useState(false);
  const [applicationFormError, setApplicationFormError] = useState("");
  const [likedJobs, setLikedJobs] = useState(getLikedJobs);
  const [applyingJobId, setApplyingJobId] = useState("");
  const [applicationMessage, setApplicationMessage] = useState("");
  const [detailsJob, setDetailsJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [suggestingJob, setSuggestingJob] = useState(null);
  const [suggestionText, setSuggestionText] = useState("");
  const [suggestionError, setSuggestionError] = useState("");
  const [savingSuggestion, setSavingSuggestion] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState("");
  const [adminMessage, setAdminMessage] = useState("");

  useEffect(() => {
    if (location.hash !== "#job-listings") return undefined;
    const frame = requestAnimationFrame(() => {
      document.getElementById("job-listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const syncLikedJobs = () => setLikedJobs(getLikedJobs());
    window.addEventListener(LIKED_JOBS_EVENT, syncLikedJobs);
    window.addEventListener("storage", syncLikedJobs);
    return () => {
      window.removeEventListener(LIKED_JOBS_EVENT, syncLikedJobs);
      window.removeEventListener("storage", syncLikedJobs);
    };
  }, []);

  useEffect(() => {
    if (role !== "freelancer") return undefined;
    let active = true;
    getMyApplications()
      .then((applications) => {
        if (!active || !Array.isArray(applications)) return;
        const statuses = {};
        const byJob = {};
        applications.forEach((application) => {
          const id = application.job?._id || application.job;
          if (id) {
            statuses[id.toString()] = application.status;
            byJob[id.toString()] = application;
          }
        });
        setApplicationStatuses(statuses);
        setApplicationsByJob(byJob);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [role]);

  async function handleApply(job) {
    const jobId = job._id || job.id;
    if (!jobId) return;
    const existing = applicationsByJob[jobId.toString()];
    setApplicationFormError("");
    setDetailsJob(null);
    setApplicationFormJob({ job, application: existing || null });
  }

  async function handleSaveApplication(event) {
    event.preventDefault();
    if (!applicationFormJob) return;
    const values = new FormData(event.currentTarget);
    const job = applicationFormJob.job;
    const jobId = String(job._id || job.id);
    const data = { bidAmount: values.get("bidAmount") || job.budget, applicationNote: String(values.get("applicationNote") || "").trim() };
    setSavingApplication(true);
    setApplyingJobId(jobId);
    setApplicationFormError("");
    try {
      const existing = applicationFormJob.application;
      const result = existing
        ? await updateMyApplication(existing._id, data)
        : await applyToJob(jobId, data);
      const savedApplication = result.application;
      setApplicationStatuses((current) => ({ ...current, [jobId]: savedApplication?.status || "pending" }));
      setApplicationsByJob((current) => ({ ...current, [jobId]: savedApplication || { ...data, status: "pending", job } }));
      setApplicationMessage(existing ? "Your bid and note were updated." : "Your application was sent to the client.");
      setApplicationFormJob(null);
    } catch (requestError) {
      setApplicationFormError(requestError.message || "Could not save your application.");
    } finally {
      setApplyingJobId("");
      setSavingApplication(false);
    }
  }

  function handleViewDetails(job) {
    setDetailsJob(job);
    setApplicationMessage("");
  }

  function handleToggleLike(job) {
    setLikedJobs(toggleLikedJob(job));
  }

  async function handleSaveJob(event) {
    event.preventDefault();
    if (!editingJob?._id && !editingJob?.id) return;
    const values = new FormData(event.currentTarget);
    setSavingEdit(true);
    setEditError("");
    try {
      const jobId = editingJob._id || editingJob.id;
      const result = await updateJob(jobId, {
        title: values.get("title").trim(),
        image: values.get("image").trim(),
        budget: Number(values.get("budget")),
        duration: values.get("duration").trim(),
        category: values.get("category"),
        description: values.get("description").trim(),
      });
      const updatedJob = result.updatedJob;
      setListings((current) => current.map((job) =>
        String(job._id || job.id) === String(jobId) ? updatedJob : job,
      ));
      setEditingJob(null);
      setAdminMessage("Job updated and sent to admin for review.");
      window.dispatchEvent(new Event("jobportal:jobs-updated"));
    } catch (requestError) {
      setEditError(requestError.message || "Could not update this job.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleSendSuggestion(event) {
    event.preventDefault();
    if (!suggestingJob) return;
    setSavingSuggestion(true);
    setSuggestionError("");
    try {
      const result = await suggestJobEdit(suggestingJob._id, suggestionText);
      setListings((current) => current.map((job) =>
        String(job._id || job.id) === String(suggestingJob._id) ? result.updatedJob : job,
      ));
      setSuggestingJob(null);
      setSuggestionText("");
      setAdminMessage("Edit suggestion sent to the client.");
      window.dispatchEvent(new Event("jobportal:jobs-updated"));
    } catch (requestError) {
      setSuggestionError(requestError.message || "Could not send the suggestion.");
    } finally {
      setSavingSuggestion(false);
    }
  }

  async function handleAdminDelete(job) {
    const jobId = job._id || job.id;
    if (!jobId || !window.confirm(`Delete “${job.title}” permanently?`)) return;
    setDeletingJobId(String(jobId));
    setAdminMessage("");
    try {
      await deleteAdminJob(jobId);
      setListings((current) => current.filter((item) => String(item._id || item.id) !== String(jobId)));
      setAdminMessage("Job deleted.");
      window.dispatchEvent(new Event("jobportal:jobs-updated"));
    } catch (requestError) {
      setAdminMessage(requestError.message || "Could not delete the job.");
    } finally {
      setDeletingJobId("");
    }
  }

  async function handleClientDelete(job) {
    const jobId = job._id || job.id;
    if (!jobId || !window.confirm(`Delete “${job.title}” and its applications?`)) return;
    setDeletingJobId(String(jobId));
    setAdminMessage("");
    try {
      await deleteClientJob(jobId);
      setListings((current) => current.filter((item) => String(item._id || item.id) !== String(jobId)));
      setAdminMessage("Job and its applications deleted.");
      window.dispatchEvent(new Event("jobportal:jobs-updated"));
    } catch (requestError) {
      setAdminMessage(requestError.message || "Could not delete the job.");
    } finally {
      setDeletingJobId("");
    }
  }

  async function handleAdminReview(job, decision) {
    const jobId = job._id || job.id;
    if (!jobId) return;
    setAdminMessage("");
    try {
      const result = await reviewJob(jobId, decision);
      setListings((current) => current.map((item) =>
        String(item._id || item.id) === String(jobId) ? result.updatedJob : item,
      ));
      setAdminMessage(result.message || `Job ${decision}.`);
      window.dispatchEvent(new Event("jobportal:jobs-updated"));
    } catch (requestError) {
      setAdminMessage(requestError.message || `Could not ${decision} this job.`);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    const refreshListings = () => {
      fetch(API_BASE + (JOB_ENDPOINTS[requestRole] || JOB_ENDPOINTS.public), {
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body.message || body.error || "Could not load jobs.");
        }
        return body;
      })
      .then((body) => {
        if (controller.signal.aborted) return;
        const backendJobs = Array.isArray(body) ? body : [];
        if (isGuest) {
          setListings(combineFeaturedAndLiveJobs(backendJobs));
          setUsingSamples(true);
        } else {
          setListings(backendJobs);
          setUsingSamples(false);
        }
        setLoading(false);
      })
        .catch((requestError) => {
          if (requestError.name === "AbortError") return;
          if (isGuest) {
            setListings(sampleJobs);
            setUsingSamples(true);
          } else {
            setError(requestError.message || "Could not connect to the jobs service.");
            setListings([]);
            setUsingSamples(false);
          }
          setLoading(false);
        });
    };

    refreshListings();
    window.addEventListener("jobportal:jobs-updated", refreshListings);
    return () => {
      controller.abort();
      window.removeEventListener("jobportal:jobs-updated", refreshListings);
    };
  }, [requestRole]);

  const filteredJobs = useMemo(
    () =>
      listings.filter((job) => {
        const matchesCategory =
          activeCategory === "Any type of work" ||
          normalizeCategory(job.category) === normalizeCategory(activeCategory);
        if (!matchesCategory) return false;
        if (!searchTerm) return true;

        const searchableText = [
          job.title,
          job.category,
          job.description,
          job.client?.name,
          ...(Array.isArray(job.skills) ? job.skills : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchTerm
          .split(/\s+/)
          .filter(Boolean)
          .every((word) => searchableText.includes(word));
      }),
    [activeCategory, listings, searchTerm],
  );

  if (detailsJob) {
    const normalizedDetailCategory = normalizeCategory(detailsJob.category);
    const detailImageCategory = Object.keys(CATEGORY_IMAGES).find(
      (category) => normalizeCategory(category) === normalizedDetailCategory,
    );
    const detailImage = detailsJob.image || CATEGORY_IMAGES[detailImageCategory] || officeWorkImage;
    const detailJobId = (detailsJob._id || detailsJob.id || "").toString();
    const detailApplicationStatus = applicationStatuses[detailJobId];
    const detailIsOpen = detailsJob.status === "open" && (detailsJob.moderationStatus || "approved") === "approved";

    return (
      <main className="job-detail-page" role="dialog" aria-modal="true" aria-labelledby="job-detail-page-title">
        <div className="job-detail-page__hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(14, 11, 25, .08) 0%, rgba(14, 11, 25, .5) 42%, #100d1b 100%), url("${detailImage}")` }}>
          <button className="job-detail-page__back" type="button" onClick={() => setDetailsJob(null)}>â† Back to openings</button>
          <div className="job-detail-page__hero-copy">
            <span className="job-detail-page__category">{detailsJob.category || "General"}</span>
            <p>Project opportunity</p>
          </div>
        </div>
        <div className="job-detail-page__layout">
          <article className="job-detail-page__description-card">
            <p className="job-detail-page__eyebrow">About the project</p>
            <h1 id="job-detail-page-title">{detailsJob.title}</h1>
            <p className="job-detail-page__byline">
              {detailsJob.client?.name ? `Posted by ${detailsJob.client.name}` : "A new opportunity for your next project"}
              {detailsJob.duration ? ` · ${detailsJob.duration}` : ""}
            </p>
            <div className="job-detail-page__chips">
              {detailsJob.budget != null && <span>{formatBudget(detailsJob)}</span>}
              {detailsJob.duration && <span>{detailsJob.duration}</span>}
              {detailsJob.status && <span>{detailsJob.status.replaceAll("-", " ")}</span>}
            </div>
            <h2>Project description</h2>
            <p className="job-detail-page__body">{detailsJob.description || "The client has not added a detailed project description yet."}</p>
            {Array.isArray(detailsJob.skills) && detailsJob.skills.length > 0 && (
              <div className="job-detail-page__skills-block">
                <h2>Skills and experience</h2>
                <div className="job-detail-page__skills">{detailsJob.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
              </div>
            )}
          </article>
          <aside className="job-detail-page__action-card">
            <p className="job-detail-page__eyebrow">Project snapshot</p>
            <h2>{detailsJob.client?.name || "Hiring client"}</h2>
            <dl>
              {detailsJob.budget != null && <div><dt>Budget</dt><dd>{formatBudget(detailsJob)}</dd></div>}
              {detailsJob.duration && <div><dt>Duration</dt><dd>{detailsJob.duration}</dd></div>}
              <div><dt>Category</dt><dd>{detailsJob.category || "General"}</dd></div>
              {role === "admin" && <div><dt>Review status</dt><dd>{detailsJob.moderationStatus || "approved"}</dd></div>}
            </dl>
            {requestRole === "freelancer" && (
              <div className="job-detail-page__application-actions">
                <button className="job-detail-page__primary" type="button" disabled={!detailIsOpen || Boolean(detailApplicationStatus) || applyingJobId === detailJobId} onClick={() => handleApply(detailsJob)}>
                  {detailApplicationStatus === "pending" ? "Applied" : detailApplicationStatus === "approved" ? "Application approved" : detailApplicationStatus === "rejected" ? "Not selected" : applyingJobId === detailJobId ? "Sending…" : "Apply now"}
                </button>
                {detailApplicationStatus === "pending" && <button className="job-detail-page__edit-application" type="button" disabled={!detailIsOpen} onClick={() => handleApply(detailsJob)}>Edit bid / note</button>}
              </div>
            )}
            {requestRole === "public" && (
              <button className="job-detail-page__primary" type="button" onClick={() => navigate("/signup?role=freelancer")}>Sign up to apply</button>
            )}
            {applicationMessage && requestRole === "freelancer" && <p className="job-detail-page__message" role="status">{applicationMessage}</p>}
            <p className="job-detail-page__note">Review the full brief and confirm the project scope with the client before starting work.</p>
          </aside>
        </div>
      </main>
    );
  }

  return (
    <section id="job-listings" className="job-listings" aria-labelledby="job-listings-title">
      <div className="job-listings__heading">
        <div>
          <p className="job-listings__eyebrow">
            {requestRole === "admin" ? "Platform jobs" : "Find your next opportunity"}
          </p>
          <h1 id="job-listings-title">{searchTerm ? `Search results for “${searchParams.get("search").trim()}”` : "Explore freelance jobs"}</h1>
        </div>
        <span className="job-listings__total">
          {loading ? "Loading…" : filteredJobs.length + (filteredJobs.length === 1 ? " job" : " jobs")}
        </span>
      </div>

      {usingSamples && !loading && (
        <p className="job-listings__notice" role="status">
          Featured jobs are shown by work type, alongside new listings posted by clients.
        </p>
      )}
      {error && <p className="job-listings__error" role="alert">{error}</p>}
      {adminMessage && <p className="job-application-message" role="status">{adminMessage}</p>}

      <div className="job-listings__layout">
        <aside className="job-listings__sidebar">
          <h2>Type of work</h2>
          <div className="job-listings__categories" role="radiogroup" aria-label="Filter jobs by type of work">
            {categories.map((category) => (
              <label className="job-listings__category" key={category}>
                <input
                  type="radio"
                  name={"job-category-" + requestRole}
                  value={category}
                  checked={activeCategory === category}
                  onChange={() => setActiveCategory(category)}
                />
                <span className="job-listings__radio" aria-hidden="true" />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </aside>

        <div className="job-listings__results">
          <div className="job-listings__grid">
            {filteredJobs.map((job, index) => {
              const normalizedCategory = normalizeCategory(job.category);
              const matchingCategory = Object.keys(CATEGORY_IMAGES).find(
                (category) => normalizeCategory(category) === normalizedCategory,
              );
              const image = CATEGORY_IMAGES[matchingCategory] || officeWorkImage;
              const key = job._id || job.id || job.title + "-" + index;
              return (
                <article
                  className="listing-card"
                  key={key}
                >
                  <img
                    className="listing-card__image"
                    src={job.image || image}
                    alt={job.category + " work"}
                    loading="lazy"
                    onError={(event) => {
                      if (event.currentTarget.src !== new URL(image, window.location.href).href) {
                        event.currentTarget.src = image;
                      }
                    }}
                  />
                  <div className="listing-card__body">
                    <div className="listing-card__meta">
                      <span className="listing-card__category">{job.category || "General"}</span>
                      {(role === "client" || role === "admin") && (
                        <span className={`listing-card__status is-${job.moderationStatus || "approved"}`}>
                          {job.moderationStatus || "approved"}
                        </span>
                      )}
                      {job.status && job.status !== "open" && <span className="listing-card__status">{job.status}</span>}
                    </div>
                    <h2 className="listing-card__title">{job.title}</h2>
                    {job.description && (
                      <p className="listing-card__description">{job.description}</p>
                    )}
                    <div className="listing-card__details">
                      {formatBudget(job) && <span>{formatBudget(job)}</span>}
                      {job.duration && <span>{job.duration}</span>}
                    </div>
                    {Array.isArray(job.skills) && job.skills.length > 0 && (
                      <div className="listing-card__skills">
                        {job.skills.slice(0, 4).map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>
                    )}
                    {job.client?.name && (
                      <p className="listing-card__client">Posted by {job.client.name}</p>
                    )}
                    {role === "client" && job.adminSuggestion && (
                      <div className="job-admin-suggestion">
                        <strong>Admin suggested an edit</strong>
                        <p>{job.adminSuggestion}</p>
                        {job.adminSuggestedAt && <small>{new Date(job.adminSuggestedAt).toLocaleDateString()}</small>}
                      </div>
                    )}
                    {role === "client" && job._id && (
                      <div className="listing-card__actions">
                        <button type="button" className="listing-card__view" onClick={() => handleViewDetails(job)}>View details</button>
                        <button type="button" className="listing-card__edit" onClick={() => { setEditError(""); setEditingJob(job); }}>
                          Edit job
                        </button>
                        <button type="button" className="listing-card__delete" disabled={deletingJobId === String(job._id)} onClick={() => handleClientDelete(job)}>
                          {deletingJobId === String(job._id) ? "Deleting…" : "Delete job"}
                        </button>
                      </div>
                    )}
                    {requestRole === "freelancer" && (
                      <div className="listing-card__actions">
                        <button
                          type="button"
                          className={`listing-card__like${likedJobs.some((likedJob) => jobFavoriteKey(likedJob) === jobFavoriteKey(job)) ? " is-liked" : ""}`}
                          aria-pressed={likedJobs.some((likedJob) => jobFavoriteKey(likedJob) === jobFavoriteKey(job))}
                          onClick={() => handleToggleLike(job)}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>
                          {likedJobs.some((likedJob) => jobFavoriteKey(likedJob) === jobFavoriteKey(job)) ? "Liked" : "Like"}
                        </button>
                        <button type="button" className="listing-card__view" onClick={() => handleViewDetails(job)}>
                          View details
                        </button>
                        <button
                          type="button"
                          className="listing-card__apply"
                          disabled={Boolean(applicationStatuses[key]) || applyingJobId === key || job.status !== "open"}
                          onClick={() => handleApply(job)}
                        >
                          {applicationStatuses[key] === "pending" ? "Applied" :
                            applicationStatuses[key] === "approved" ? "Approved" :
                            applicationStatuses[key] === "rejected" ? "Not selected" :
                            applyingJobId === key ? "Sending…" : "Apply"}
                        </button>
                        {applicationStatuses[key] === "pending" && <button type="button" className="listing-card__edit" onClick={() => handleApply(job)}>Edit bid / note</button>}
                      </div>
                    )}
                    {role === "admin" && (
                      <div className="listing-card__actions listing-card__actions--admin">
                        {(job.moderationStatus || "approved") === "pending" && (
                          <>
                            <button type="button" className="listing-card__approve" onClick={() => handleAdminReview(job, "approved")}>Approve job</button>
                            <button type="button" className="listing-card__reject" onClick={() => handleAdminReview(job, "rejected")}>Reject job</button>
                          </>
                        )}
                        <button type="button" className="listing-card__view" onClick={() => handleViewDetails(job)}>View details</button>
                        <button type="button" className="listing-card__edit" onClick={() => { setSuggestingJob(job); setSuggestionText(job.adminSuggestion || ""); setSuggestionError(""); }}>Suggest edit</button>
                        <button type="button" className="listing-card__delete" disabled={deletingJobId === String(job._id || job.id)} onClick={() => handleAdminDelete(job)}>
                          {deletingJobId === String(job._id || job.id) ? "Deleting…" : "Delete job"}
                        </button>
                      </div>
                    )}
                    {requestRole === "public" && (
                      <div className="listing-card__actions">
                        <button type="button" className="listing-card__view" onClick={() => handleViewDetails(job)}>View details</button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
            {!loading && !error && filteredJobs.length === 0 && (
              <p className="job-listings__empty">
                {searchTerm ? "No jobs matched your search. Try a different title, skill, or keyword." : "No jobs in this work category yet."}
              </p>
            )}
            {loading && <p className="job-listings__empty">Loading job listings…</p>}
          </div>
          {requestRole === "freelancer" && applicationMessage && (
            <p className="job-application-message" role="status">{applicationMessage}</p>
          )}
        </div>
      </div>
      {requestRole === "freelancer" && applicationFormJob && (
        <div className="job-detail-backdrop" role="presentation" onClick={() => !savingApplication && setApplicationFormJob(null)}>
          <section className="job-detail-dialog job-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="freelancer-application-title" onClick={(event) => event.stopPropagation()}>
            <button className="job-detail-dialog__close" type="button" aria-label="Close application form" disabled={savingApplication} onClick={() => setApplicationFormJob(null)}>×</button>
            <p className="job-listings__eyebrow">Freelancer proposal</p>
            <h2 id="freelancer-application-title">{applicationFormJob.application ? "Edit your application" : "Apply to this job"}</h2>
            <p className="job-detail-dialog__description">{applicationFormJob.job.title} · Tell the client your bid and add a short note.</p>
            <div className="job-proposal-budget"><span>Client’s original budget</span><strong>{applicationFormJob.job.budget}{applicationFormJob.job.budgetType === "hourly" ? " / hour" : ""}</strong><small>Keep this amount or change it to submit a different bid.</small></div>
            <form className="job-edit-form" onSubmit={handleSaveApplication}>
              <label>Your bid amount<input name="bidAmount" type="number" min="0.01" step="0.01" required defaultValue={applicationFormJob.application?.bidAmount ?? applicationFormJob.job.budget ?? ""} /></label>
              <label>Note to the client<textarea name="applicationNote" rows="5" maxLength="2000" defaultValue={applicationFormJob.application?.applicationNote || ""} placeholder="Briefly explain your approach, relevant experience, or any scope details…" /></label>
              {applicationFormError && <p className="job-edit-form__error" role="alert">{applicationFormError}</p>}
              <div className="job-edit-form__actions">
                <button type="button" className="job-edit-form__cancel" disabled={savingApplication} onClick={() => setApplicationFormJob(null)}>Cancel</button>
                <button type="submit" disabled={savingApplication}>{savingApplication ? "Saving…" : applicationFormJob.application ? "Save bid and note" : "Send application"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
      {role === "client" && editingJob && (
        <div className="job-detail-backdrop" role="presentation" onClick={() => !savingEdit && setEditingJob(null)}>
          <section className="job-detail-dialog job-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-job-title" onClick={(event) => event.stopPropagation()}>
            <button className="job-detail-dialog__close" type="button" aria-label="Close job editor" disabled={savingEdit} onClick={() => setEditingJob(null)}>×</button>
            <p className="job-listings__eyebrow">Your job listing</p>
            <h2 id="edit-job-title">Edit job</h2>
            {editingJob.adminSuggestion && <div className="job-admin-suggestion"><strong>Admin suggested an edit</strong><p>{editingJob.adminSuggestion}</p><small>Save your changes to clear this suggestion.</small></div>}
            <form className="job-edit-form" onSubmit={handleSaveJob}>
              <label>Job title<input name="title" type="text" minLength="5" maxLength="120" defaultValue={editingJob.title || ""} required /></label>
              <label>Picture URL<input name="image" type="url" defaultValue={editingJob.image || ""} placeholder="https://example.com/image.jpg" /></label>
              <div className="job-edit-form__row">
                <label>Budget amount<input name="budget" type="number" min="1" step="0.01" defaultValue={editingJob.budget ?? ""} required /></label>
                <label>Duration<input name="duration" type="text" defaultValue={editingJob.duration || ""} required /></label>
              </div>
              <label>Type of work
                <select name="category" defaultValue={editingJob.category || "General"} required>
                  {!categories.some((category) => category === editingJob.category) && <option value={editingJob.category || "General"}>{editingJob.category || "General"}</option>}
                  {categories.filter((category) => category !== "Any type of work").map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label>Job description<textarea name="description" minLength="20" rows="6" defaultValue={editingJob.description || ""} required /></label>
              {editError && <p className="job-edit-form__error" role="alert">{editError}</p>}
              <div className="job-edit-form__actions">
                <button type="button" className="job-edit-form__cancel" disabled={savingEdit} onClick={() => setEditingJob(null)}>Cancel</button>
                <button type="submit" disabled={savingEdit}>{savingEdit ? "Saving changes…" : "Save changes"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
      {role === "admin" && suggestingJob && (
        <div className="job-detail-backdrop" role="presentation" onClick={() => !savingSuggestion && setSuggestingJob(null)}>
          <section className="job-detail-dialog job-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="suggest-edit-title" onClick={(event) => event.stopPropagation()}>
            <button className="job-detail-dialog__close" type="button" aria-label="Close suggestion form" disabled={savingSuggestion} onClick={() => setSuggestingJob(null)}>×</button>
            <p className="job-listings__eyebrow">For {suggestingJob.client?.name || "the client"}</p>
            <h2 id="suggest-edit-title">Suggest changes to “{suggestingJob.title}”</h2>
            <p className="job-detail-dialog__description">Describe what the client should update. They will see your note on their job card and can edit the listing themselves.</p>
            <form className="job-edit-form" onSubmit={handleSendSuggestion}>
              <label>Suggested changes<textarea rows="6" maxLength="3000" required value={suggestionText} onChange={(event) => setSuggestionText(event.target.value)} placeholder="Explain the changes needed to this job listing…" /></label>
              {suggestionError && <p className="job-edit-form__error" role="alert">{suggestionError}</p>}
              <div className="job-edit-form__actions">
                <button type="button" className="job-edit-form__cancel" disabled={savingSuggestion} onClick={() => setSuggestingJob(null)}>Cancel</button>
                <button type="submit" disabled={savingSuggestion}>{savingSuggestion ? "Sending…" : "Send to client"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

