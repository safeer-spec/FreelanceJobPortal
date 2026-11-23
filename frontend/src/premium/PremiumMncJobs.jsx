import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./PremiumMncJobs.css";

export const MNC_COMPANIES = [
  { slug: "google", name: "Google", mark: "G", team: "Technology · AI · Cloud", note: "Build products and services used around the world.", url: (q) => `https://www.google.com/about/careers/applications/jobs/results/?q=${encodeURIComponent(q)}`, accent: "blue" },
  { slug: "amazon", name: "Amazon", mark: "a", team: "Technology · Operations · Business", note: "Explore roles across Amazon and its global teams.", url: (q) => `https://www.amazon.jobs/en/search?base_query=${encodeURIComponent(q)}&country%5B%5D=IND`, accent: "orange" },
  { slug: "microsoft", name: "Microsoft", mark: "M", team: "Software · Cloud · Design", note: "Find opportunities across Microsoft products and teams.", url: () => "https://careers.microsoft.com/v2/global/en/home", accent: "cyan" },
  { slug: "adobe", name: "Adobe", mark: "A", team: "Design · Engineering · Marketing", note: "Create tools and experiences for people everywhere.", url: () => "https://careers.adobe.com/us/en", accent: "red" },
  { slug: "ibm", name: "IBM", mark: "IBM", team: "Consulting · AI · Engineering", note: "Explore roles in consulting, research, and technology.", url: () => "https://www.ibm.com/careers/search", accent: "navy" },
  { slug: "accenture", name: "Accenture", mark: "A", team: "Consulting · Digital · Operations", note: "Browse global consulting and technology careers.", url: () => "https://www.accenture.com/in-en/careers", accent: "purple" },
  { slug: "tcs", name: "TCS", mark: "TCS", team: "IT · Consulting · Graduate roles", note: "Explore opportunities with a global IT services company.", url: () => "https://www.tcs.com/careers", accent: "blue" },
  { slug: "infosys", name: "Infosys", mark: "I", team: "Engineering · Consulting · Early careers", note: "Search roles and early career programs at Infosys.", url: () => "https://www.infosys.com/careers/", accent: "orange" },
];
const ROLE_SUGGESTIONS = ["Software engineering", "Data and AI", "Product design", "Consulting", "Graduate roles"];

export default function PremiumMncJobs() {
  const [query, setQuery] = useState("");
  const visibleCompanies = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term || ROLE_SUGGESTIONS.some((role) => role.toLowerCase() === term)) return MNC_COMPANIES;
    const exactCompanyMatches = MNC_COMPANIES.filter((company) => company.name.toLowerCase().includes(term));
    return exactCompanyMatches.length ? exactCompanyMatches : MNC_COMPANIES;
  }, [query]);

  return <main className="premium-mnc-page">
    <section className="premium-mnc-hero" aria-labelledby="premium-mnc-title">
      <div className="premium-mnc-hero__copy">
        <p className="premium-mnc-hero__eyebrow"><span /> GLOBAL CAREER NETWORK</p>
        <h1 id="premium-mnc-title">Your next role could be <span>worldwide.</span></h1>
        <p>Explore multinational employers and continue to their official careers sites to find current openings and apply.</p>
        <div className="premium-mnc-hero__signals"><span><i /> Official career portals</span><span><i /> Roles across teams</span><span><i /> Apply directly</span></div>
      </div>
      <div className="premium-mnc-hero__visual" aria-hidden="true">
        <div className="premium-mnc-hero__globe"><div className="premium-mnc-hero__longitude" /><div className="premium-mnc-hero__latitude" /><span className="premium-mnc-hero__pin premium-mnc-hero__pin--one" /><span className="premium-mnc-hero__pin premium-mnc-hero__pin--two" /><span className="premium-mnc-hero__pin premium-mnc-hero__pin--three" /></div>
        <div className="premium-mnc-hero__orbit-card premium-mnc-hero__orbit-card--one"><b>GLOBAL TEAMS</b><span /><span /><span /></div>
        <div className="premium-mnc-hero__orbit-card premium-mnc-hero__orbit-card--two"><i>↗</i><b>CAREER</b><small>OPPORTUNITIES</small></div>
        <span className="premium-mnc-hero__spark premium-mnc-hero__spark--one">✦</span><span className="premium-mnc-hero__spark premium-mnc-hero__spark--two">✧</span>
      </div>
    </section>
    <div className="premium-mnc-content">
      <Link className="premium-feature-page__back" to="/premium">← Back to Premium</Link>
      <header className="premium-mnc-heading"><p className="premium-feature-page__eyebrow">PREMIUM OPPORTUNITIES</p><h2>Explore multinational careers</h2><p>These links open employer career portals. Open a role there to review its requirements and submit your application directly to the company.</p></header>
      <section className="premium-mnc-search" aria-label="Find a company career site">
        <label htmlFor="premium-mnc-role">Role or company<input id="premium-mnc-role" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. software engineer, Google, consulting" /></label>
        <div className="premium-mnc-chips" aria-label="Popular role searches">{ROLE_SUGGESTIONS.map((role) => <button type="button" key={role} onClick={() => setQuery(role)} className={query === role ? "is-active" : ""}>{role}</button>)}</div>
      </section>
      <div className="premium-mnc-grid">
        {visibleCompanies.map((company) => <article className={`premium-mnc-card premium-mnc-card--${company.accent}`} key={company.name}>
          <div className="premium-mnc-card__top"><span className="premium-mnc-card__mark" aria-hidden="true">{company.mark}</span><span className="premium-mnc-card__verified"><i /> Official site</span></div>
          <p className="premium-mnc-card__team">{company.team}</p><h3>{company.name}</h3><p className="premium-mnc-card__note">{company.note}</p>
          <Link className="premium-mnc-card__link" to={`/premium/mnc-jobs/${company.slug}`}>Company details <span aria-hidden="true">→</span></Link>
        </article>)}
      </div>
      {visibleCompanies.length === 0 && <p className="premium-mnc-empty">No company matches that search. Try a role area or one of the suggested searches.</p>}
      <p className="premium-mnc-footnote">Openings and application requirements are managed by each employer. Your UpSkill profile is not submitted automatically.</p>
    </div>
  </main>;
}
