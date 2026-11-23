import { useState } from "react";
import ProfileLayout from "./ProfileLayout.jsx";
import JobListings from "../components/JobListings.jsx";
import ClientApplications from "./ClientApplications.jsx";
import Reviews from "./Reviews.jsx";
import JobStatusDashboard from "./JobStatusDashboard.jsx";
import ClientSubscription from "./ClientSubscription.jsx";
import ClientQuoteCarousel from "./ClientQuoteCarousel.jsx";
import { createJob } from "../services/jobservices";
import { categories } from "../Mainp.jsx/jobs";
import "./clientJobs.css";

export default function Client() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreateJob(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await createJob({
        title: values.get("title").trim(),
        image: values.get("image").trim(),
        budget: Number(values.get("budget")),
        description: values.get("description").trim(),
        duration: values.get("duration").trim(),
        category: values.get("category"),
      });
      setSuccess("Your job was submitted for admin review. It will appear in listings after approval.");
      form.reset();
      window.dispatchEvent(new Event("jobportal:jobs-updated"));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProfileLayout role="client" title="Client dashboard">
      <ClientQuoteCarousel />
      <JobStatusDashboard role="client" />
      <ClientSubscription />
      <section className="client-job-create" aria-labelledby="create-job-title">
        <div className="client-job-create__heading">
          <p className="client-job-create__eyebrow">Hiring workspace</p>
          <h2 id="create-job-title">Create a job</h2>
          <p>Share the work, budget, and skills you need. Your job will wait for admin approval before freelancers can see it.</p>
        </div>

        <form className="client-job-form" onSubmit={handleCreateJob}>
          <label>
            Job title
            <input name="title" type="text" minLength="5" maxLength="120" placeholder="e.g. Build a responsive React website" required />
          </label>

          <label>
            Picture URL
            <input name="image" type="url" placeholder="https://example.com/job-image.jpg" />
          </label>

          <div className="client-job-form__row">
            <label>
              Budget amount
              <input name="budget" type="number" min="1" step="0.01" placeholder="500" required />
            </label>

            <label>
              Duration
              <input name="duration" type="text" placeholder="e.g. 2 weeks" required />
            </label>
          </div>

          <label>
            Type of work
            <select name="category" defaultValue="" required>
              <option value="" disabled>Select a category</option>
              {categories.filter((category) => category !== "Any type of work").map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>

          <label>
            Job description
            <textarea name="description" minLength="20" rows="5" placeholder="Describe the work, requirements, and expected result." required />
          </label>

          {error && <p className="client-job-form__message is-error" role="alert">{error}</p>}
          {success && <p className="client-job-form__message is-success" role="status">{success}</p>}

          <button className="client-job-form__submit" type="submit" disabled={submitting}>
            {submitting ? "Posting job…" : "Post job"}
          </button>
        </form>
      </section>

      <div className="client-feedback-panels">
        <ClientApplications />
        <Reviews role="client" />
      </div>
      <JobListings role="client" />
    </ProfileLayout>
  );
}
