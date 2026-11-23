import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { MNC_COMPANIES } from "./PremiumMncJobs.jsx";
import "./PremiumMncJobs.css";

const EMPTY_FORM = { fullName: "", email: "", phone: "", role: "", location: "", resumeUrl: "", note: "" };

export default function PremiumMncCompanyPage() {
  const { companySlug } = useParams();
  const company = MNC_COMPANIES.find((item) => item.slug === companySlug);
  const [form, setForm] = useState(EMPTY_FORM);
  const [continued, setContinued] = useState(false);
  if (!company) return <Navigate to="/premium/mnc-jobs" replace />;

  function updateField(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  function continueToHr(event) {
    event.preventDefault();
    window.open(company.url(form.role.trim()), "_blank", "noopener,noreferrer");
    setContinued(true);
  }

  return <main className="premium-mnc-page">
    <div className="premium-mnc-content premium-mnc-detail">
      <Link className="premium-feature-page__back" to="/premium/mnc-jobs">← All MNC careers</Link>
      <section className={`premium-mnc-detail__hero premium-mnc-card--${company.accent}`}>
        <div className="premium-mnc-detail__brand"><span className="premium-mnc-card__mark" aria-hidden="true">{company.mark}</span><span className="premium-mnc-card__verified"><i /> Official career portal</span></div>
        <p className="premium-feature-page__eyebrow">MULTINATIONAL CAREER PROFILE</p>
        <h1>{company.name} careers</h1>
        <p>{company.note} Explore current roles in {company.team.toLowerCase()}.</p>
        <a className="premium-mnc-card__link premium-mnc-detail__official-link" href={company.url(form.role.trim())} target="_blank" rel="noopener noreferrer">Browse {company.name} openings <span aria-hidden="true">↗</span></a>
      </section>
      <section className="premium-mnc-application">
        <div className="premium-mnc-application__intro"><p className="premium-feature-page__eyebrow">APPLICATION HANDOFF</p><h2>Prepare your details</h2><p>Review your information here, then continue to {company.name}'s official HR portal to complete and submit the application.</p></div>
        <form className="premium-mnc-application__form" onSubmit={continueToHr}>
          <div className="premium-mnc-application__grid">
            <label>Full name<input name="fullName" value={form.fullName} onChange={updateField} maxLength={120} required autoComplete="name" /></label>
            <label>Email address<input name="email" type="email" value={form.email} onChange={updateField} maxLength={254} required autoComplete="email" /></label>
            <label>Phone number<input name="phone" type="tel" value={form.phone} onChange={updateField} maxLength={40} autoComplete="tel" /></label>
            <label>Role you want to apply for<input name="role" value={form.role} onChange={updateField} maxLength={160} required placeholder="e.g. Graduate software engineer" /></label>
            <label>Preferred location<input name="location" value={form.location} onChange={updateField} maxLength={120} placeholder="e.g. Bengaluru, India" /></label>
            <label>CV or portfolio link<input name="resumeUrl" type="url" value={form.resumeUrl} onChange={updateField} maxLength={1000} placeholder="https://" /></label>
          </div>
          <label className="premium-mnc-application__wide">Short note<textarea name="note" value={form.note} onChange={updateField} rows={4} maxLength={2000} placeholder="A short introduction for your application." /></label>
          <p className="premium-mnc-application__privacy">Your entries stay in this page and are not sent to UpSkill. Company application systems differ, so this form cannot transfer them automatically; you will enter your details and submit on the official HR portal.</p>
          {continued && <p className="premium-mnc-application__success" role="status">The {company.name} career portal was opened in a new tab. Complete and submit your application there.</p>}
          <button className="premium-mnc-application__submit" type="submit">Continue to {company.name} HR portal <span aria-hidden="true">↗</span></button>
        </form>
      </section>
    </div>
  </main>;
}
