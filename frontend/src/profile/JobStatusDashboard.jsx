import { useCallback, useEffect, useState } from "react";
import { getAdminDashboardStats, getAdminJobs, getClientApplications, getClientJobs } from "../services/jobservices";
import { useAppLanguage } from "../services/language.js";
import "./jobStatusDashboard.css";

const moderationOf = (job) => job.moderationStatus || "approved";

export default function JobStatusDashboard({ role }) {
  const { t } = useAppLanguage();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [peopleStats, setPeopleStats] = useState({ freelancers: 0, clients: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (role === "admin") {
        const [jobResult, statsResult] = await Promise.all([
          getAdminJobs(),
          getAdminDashboardStats(),
        ]);
        setJobs(Array.isArray(jobResult) ? jobResult : []);
        setPeopleStats({
          freelancers: Number(statsResult.freelancers) || 0,
          clients: Number(statsResult.clients) || 0,
        });
      } else {
        const [jobResult, applicationResult] = await Promise.all([
          getClientJobs(),
          getClientApplications(),
        ]);
        setJobs(Array.isArray(jobResult) ? jobResult : []);
        setApplications(Array.isArray(applicationResult) ? applicationResult : []);
      }
    } catch (requestError) {
      setError(requestError.message || "Could not load dashboard counts.");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => { refresh(); }, [refresh, refreshKey]);

  useEffect(() => {
    const update = () => setRefreshKey((value) => value + 1);
    window.addEventListener("jobportal:jobs-updated", update);
    window.addEventListener("jobportal:applications-updated", update);
    return () => {
      window.removeEventListener("jobportal:jobs-updated", update);
      window.removeEventListener("jobportal:applications-updated", update);
    };
  }, []);

  const approved = jobs.filter((job) => moderationOf(job) === "approved");
  const pendingJobs = jobs.filter((job) => moderationOf(job) === "pending").length;
  const rejectedJobs = jobs.filter((job) => moderationOf(job) === "rejected").length;
  const metrics = role === "admin"
    ? [
        { label: "Total freelancers", value: peopleStats.freelancers, tone: "blue" },
        { label: "Total clients", value: peopleStats.clients, tone: "blue" },
        { label: "Total jobs", value: jobs.length, tone: "amber" },
        { label: "Active listings", value: approved.filter((job) => job.status === "open").length, tone: "green" },
        { label: "In progress", value: approved.filter((job) => job.status === "in-progress").length, tone: "blue" },
        { label: "Completed jobs", value: approved.filter((job) => job.status === "completed").length, tone: "green" },
        { label: "Waiting review", value: pendingJobs, tone: "amber" },
      ]
    : [
        { label: "Live jobs", value: approved.filter((job) => job.status === "open").length, tone: "green" },
        { label: "Approved", value: approved.length, tone: "green" },
        { label: "Rejected", value: rejectedJobs, tone: "red" },
        { label: "Waiting review", value: pendingJobs, tone: "amber" },
      ];

  return (
    <section className={`job-status-dashboard${role === "admin" ? " job-status-dashboard--admin" : ""}`} aria-label={t(role === "admin" ? "Review command center" : "Your job summary")}>
      {role === "admin" ? (
        <>
          <div className="admin-command__live"><span className="admin-command__live-dot" />{t("Live monitoring")}</div>
          <div className="admin-command__intro">
            <div>
              <p className="admin-command__eyebrow">{t("Moderation workspace")}</p>
              <h2>{t("Review command center")}</h2>
              <p>{t("Track incoming job listings and moderation outcomes as they land.")}</p>
            </div>
            <button type="button" onClick={() => setRefreshKey((value) => value + 1)} disabled={loading}>
              {loading ? t("Updating…") : t("Refresh dashboard")}
            </button>
          </div>
          {error && <p className="job-status-dashboard__error" role="alert">{error}</p>}
          <div className="admin-command__panels">
            <article className="admin-command__panel admin-command__panel--queue">
              <div className="admin-command__panel-top">
                <div>
                  <span className="admin-command__tag">{t("Job listings")}</span>
                  <h3>{t("Review queue")}</h3>
                </div>
                <span className="admin-command__orb admin-command__orb--gold" aria-hidden="true"><i /><b /></span>
              </div>
              <div className="admin-command__countline">
                <strong>{loading ? "—" : pendingJobs}</strong>
                <span>{t("listings waiting for an admin decision")}</span>
                <small><span className="admin-command__live-dot" />LIVE</small>
              </div>
              <div className="admin-command__panel-foot">{t("New client posts stay hidden from freelancers until approved.")}</div>
            </article>
            <article className="admin-command__panel admin-command__panel--outcomes">
              <div className="admin-command__panel-top">
                <div>
                  <span className="admin-command__tag">{t("Review outcomes")}</span>
                  <h3>{t("Moderation decisions")}</h3>
                </div>
                <span className="admin-command__orb admin-command__orb--sun" aria-hidden="true"><i /><b /></span>
              </div>
              <div className="admin-command__outcomes">
                <div><strong>{loading ? "—" : approved.length}</strong><span>{t("Approved jobs")}</span></div>
                <div><strong>{loading ? "—" : rejectedJobs}</strong><span>{t("Rejected jobs")}</span></div>
              </div>
              <div className="admin-command__panel-foot">{t("Approved listings are published to freelancers.")}</div>
            </article>
          </div>
          <div className="admin-command__section-label"><span>{t("MOD · 01 — DASHBOARD")}</span><i /></div>
          <p className="admin-command__caption">{t("Platform vitals, refreshed when jobs change or on request.")}</p>
          <div className="job-status-dashboard__grid admin-command__stats">
            {metrics.map((metric, index) => (
              <article className={`job-status-dashboard__card is-${metric.tone}`} key={metric.label} style={{ "--card-order": index }}>
                <span>{t(metric.label)}</span>
                <strong>{loading ? "—" : metric.value}</strong>
              </article>
            ))}
          </div>
        </>
      ) : (
        <>
      <div className="job-status-dashboard__heading">
        <div>
          <p className="profile-layout__eyebrow">Overview</p>
          <h2>{role === "admin" ? t("Job moderation") : t("Your job summary")}</h2>
        </div>
        <button type="button" onClick={() => setRefreshKey((value) => value + 1)} disabled={loading}>
          {loading ? t("Updating…") : t("Refresh counts")}
        </button>
      </div>
      {error && <p className="job-status-dashboard__error" role="alert">{error}</p>}
      <div className="job-status-dashboard__grid">
        {metrics.map((metric) => (
          <article className={`job-status-dashboard__card is-${metric.tone}`} key={metric.label}>
            <span>{t(metric.label)}</span>
            <strong>{loading ? "—" : metric.value}</strong>
          </article>
        ))}
      </div>
      {role === "client" && (
        <div className="job-status-dashboard__applications">
          <h3>Freelancer applications</h3>
          <div className="job-status-dashboard__grid job-status-dashboard__grid--applications">
            {[
              ["Pending", "pending"],
              ["Approved", "approved"],
              ["Rejected", "rejected"],
            ].map(([label, status]) => (
              <article className="job-status-dashboard__card is-neutral" key={status}>
                <span>{label}</span>
                <strong>{loading ? "—" : applications.filter((application) => application.status === status).length}</strong>
              </article>
            ))}
          </div>
          <p>Applications stay pending until you approve or reject them.</p>
        </div>
      )}
        </>
      )}
    </section>
  );
}
