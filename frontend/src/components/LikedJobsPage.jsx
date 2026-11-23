import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import { adminWorkImage, creativeWorkImage, developmentWorkImage, officeWorkImage } from "../Mainp.jsx/jobs";
import { getLikedJobs, jobFavoriteKey, LIKED_JOBS_EVENT, removeLikedJob } from "../services/likedJobs";
import "./jobListings.css";
import "./likedJobs.css";

const CATEGORY_IMAGES = {
  "Development & IT": developmentWorkImage,
  "Design & Creative": creativeWorkImage,
  "Finance & Accounting": officeWorkImage,
  "Admin & Customer Support": officeWorkImage,
  "Sales & Marketing": adminWorkImage,
};

function formatBudget(job) {
  if (job.budget === undefined || job.budget === null || job.budget === "") return "";
  return `Budget: ${job.budget}${job.budgetType === "hourly" ? " / hour" : ""}`;
}

export default function LikedJobsPage() {
  const [jobs, setJobs] = useState(getLikedJobs);

  useEffect(() => {
    const sync = () => setJobs(getLikedJobs());
    window.addEventListener(LIKED_JOBS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(LIKED_JOBS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function handleRemove(job) {
    setJobs(removeLikedJob(jobFavoriteKey(job)));
  }

  return (
    <>
      <Navbar />
      <main className="liked-jobs-page">
        <section className="job-listings" aria-labelledby="liked-jobs-title">
          <div className="job-listings__heading">
            <div>
              <p className="job-listings__eyebrow">Your saved work</p>
              <h1 id="liked-jobs-title">Liked jobs</h1>
            </div>
            <span className="job-listings__total">{jobs.length} {jobs.length === 1 ? "job" : "jobs"}</span>
          </div>
          {jobs.length ? (
            <div className="liked-jobs-grid">
              {jobs.map((job) => {
                const image = CATEGORY_IMAGES[job.category] || officeWorkImage;
                return (
                  <article className="listing-card" key={jobFavoriteKey(job)}>
                    <img className="listing-card__image" src={job.image || image} alt={`${job.category || "Job"} work`} onError={(event) => { event.currentTarget.src = image; }} />
                    <div className="listing-card__body">
                      <span className="listing-card__category">{job.category || "General"}</span>
                      <h2 className="listing-card__title">{job.title}</h2>
                      {job.description && <p className="listing-card__description">{job.description}</p>}
                      <div className="listing-card__details">
                        {formatBudget(job) && <span>{formatBudget(job)}</span>}
                        {job.duration && <span>{job.duration}</span>}
                      </div>
                      {job.client?.name && <p className="listing-card__client">Posted by {job.client.name}</p>}
                      <div className="listing-card__actions">
                        <button type="button" className="listing-card__remove-like" onClick={() => handleRemove(job)} aria-label={`Remove ${job.title} from liked jobs`}>Remove from liked</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="liked-jobs-empty">
              <div className="liked-jobs-empty__heart" aria-hidden="true">♡</div>
              <h2>No liked jobs yet</h2>
              <p>Save interesting jobs with the Like button and they’ll appear here.</p>
              <Link to="/jobs#job-listings">Browse jobs</Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
