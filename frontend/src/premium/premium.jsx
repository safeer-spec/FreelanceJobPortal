import "./premium.css";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { createBillingPortalSession, createCheckoutSession } from "../services/paymentservices.js";
import { getMyProfile } from "../services/profileservices.js";

const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Adobe",
  "IBM",
  "Accenture",
  "Infosys",
  "Tata Consultancy Services",
  "Wipro",
  "Oracle",
  "Salesforce",
  "Deloitte",
];

const benefits = [
  "Direct connection to the admin panel",
  "Personalized AI career assistance",
  "ATS focused CV screening and feedback",
  "Access to MNC job openings",
  "A roadmap to MNC roles from admins",
];

const premiumFeatures = [
  {
    title: "Direct admin connection",
    href: "/premium/admin-connection",
    action: "Contact the admin team",
    description: "Get a clear human point of contact for questions about your career goals and next steps.",
    details: [
      "Share your target roles, experience, and current challenges with the admin team.",
      "Ask for help understanding platform resources and how to use them in your search.",
      "Get practical guidance to keep your career plan focused and moving forward.",
    ],
    icon: "↗",
  },
  {
    title: "AI career assistance",
    href: "/premium/ai-career",
    action: "Open AI career assistant",
    description: "Use guided AI support to prepare stronger application materials and practice for interviews.",
    details: [
      "Refine CV bullets so your impact, skills, and experience are easier to understand.",
      "Practice common interview questions and organize concise, relevant answers.",
      "Explore role-specific preparation ideas and turn them into manageable next steps.",
    ],
    icon: "✦",
  },
  {
    title: "ATS CV screening",
    href: "/premium/ats-screening",
    action: "Screen my CV",
    description: "Review your CV for readability and common applicant tracking system issues before applying.",
    details: [
      "Check layout, headings, dates, and section structure for clear parsing.",
      "Compare your skills and keywords with the roles you want to pursue.",
      "Get a prioritized improvement checklist so you can revise with confidence.",
    ],
    icon: "▤",
  },
  {
    title: "MNC job openings",
    href: "/premium/mnc-jobs",
    action: "Explore open jobs",
    description: "Find multinational company roles shared with Premium members and assess how they fit your goals.",
    details: [
      "Browse openings with role, location, and key requirements summarized.",
      "Use the listed qualifications to decide which opportunities are a strong match.",
      "Follow the employer’s application link and prepare materials for each role.",
    ],
    icon: "⌕",
  },
  {
    title: "Admin guided roadmap",
    href: "/premium/roadmap",
    action: "Build my roadmap",
    description: "Build a practical sequence of career actions around your target role and current experience.",
    details: [
      "Clarify a target role and identify the skills or evidence employers commonly seek.",
      "Set milestones for learning, portfolio work, CV updates, and applications.",
      "Review progress and adjust priorities as your skills and opportunities develop.",
    ],
    icon: "◎",
  },
];

function PremiumFeatureCard({ feature, index }) {
  return (
    <article className="premium-feature-card">
      <div className="premium-feature-card__topline">
        <span className="premium-feature-card__number">{String(index + 1).padStart(2, "0")}</span>
        <span className="premium-feature-card__icon" aria-hidden="true">{feature.icon}</span>
      </div>
      <h3>{feature.title}</h3>
      <p className="premium-feature-card__description">{feature.description}</p>
      <ul>
        {feature.details.map((detail) => <li key={detail}>{detail}</li>)}
      </ul>
      <Link className="premium-feature-card__action" to={feature.href}>{feature.action} <span aria-hidden="true">→</span></Link>
    </article>
  );
}

function Premium() {
  const [searchParams] = useSearchParams();
  const showWelcome = searchParams.get("welcome") === "1";
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getMyProfile("freelancer").then((profile) => {
      if (active && profile.subscriptionPlan === "freelancer-premium") setSubscriptionStatus(profile.subscriptionStatus || "inactive");
    }).catch(() => {}).finally(() => { if (active) setSubscriptionLoading(false); });
    return () => { active = false; };
  }, []);

  const hasPremiumPlan = ["active", "trialing", "past_due", "unpaid", "incomplete"].includes(subscriptionStatus);

  async function subscribeToPremium() {
    setCheckoutError("");
    setCheckoutLoading(true);
    try {
      const url = hasPremiumPlan
        ? await createBillingPortalSession("freelancer")
        : await createCheckoutSession("freelancer");
      window.location.assign(url);
    } catch (error) {
      setCheckoutError(error.message || "Could not start secure checkout.");
      setCheckoutLoading(false);
    }
  }

  return (
    <section className="premium" aria-labelledby="premium-title">
      <div className="premium__top-action">
        <Link className="premium__back-link" to="/freelancer"><span aria-hidden="true">←</span> Continue to dashboard</Link>
        {!subscriptionLoading && !hasPremiumPlan && <a className="premium__purchase-button" href="#premium-purchase">Purchase Premium <span aria-hidden="true">↓</span></a>}
      </div>
      {showWelcome && (
        <div className="premium__welcome" role="status">
          <span aria-hidden="true">✓</span>
          <div><strong>Premium is active.</strong><p>Your freelancer benefits are ready. Start with any feature below and build your next career move.</p></div>
        </div>
      )}
      <div className="premium__inner">
        <div className="premium__intro">
          <p className="premium__eyebrow">UPSKILL PREMIUM</p>
          <h2 id="premium-title">
            Make your next career move <span>count.</span>
          </h2>
          <p className="premium__description">
            Get focused career support as you prepare for opportunities at
            leading global companies.
          </p>

          <div className="premium__company-panel">
            <div className="premium__company-heading">
              <span>COMPANIES TO EXPLORE</span>
              <span className="premium__live-dot" aria-hidden="true" />
            </div>
            <div className="premium__company-lanes" aria-label="Example global companies">
              {[companies.slice(0, 6), companies.slice(6)].map((lane, laneIndex) => (
                <div
                  className={`premium__lane premium__lane--${laneIndex + 1}`}
                  key={laneIndex}
                >
                  <div className="premium__lane-track">
                    {[...lane, ...lane].map((company, index) => (
                      <span className="premium__company" key={`${company}-${index}`}>
                        <span className="premium__company-mark" aria-hidden="true">
                          {company.charAt(0)}
                        </span>
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="premium__fine-print">
              Company names are examples only. This plan supports your job
              search; hiring decisions remain with each employer.
            </p>
          </div>
        </div>
        <article className="premium-plan" aria-label="Premium Career monthly plan">
          <div className="premium-plan__topline">
            <span className="premium-plan__badge">CAREER PLUS</span>
            <span className="premium-plan__spark" aria-hidden="true">✦</span>
          </div>
          <h3>Premium Career</h3>
          <p className="premium-plan__summary">Practical support to help you stand out and move forward.</p>
          <p className="premium-plan__price" id="premium-purchase"><strong>₹499</strong><span>/ month</span></p>
          <div className="premium-plan__divider" />
          <p className="premium-plan__includes">Your plan includes</p>
          <ul className="premium-plan__benefits">
            {benefits.map((benefit) => <li key={benefit}><span aria-hidden="true">✓</span>{benefit}</li>)}
          </ul>
          <button className="premium-plan__button" type="button" onClick={subscribeToPremium} disabled={checkoutLoading}>
            {checkoutLoading ? "Connecting to Stripe…" : hasPremiumPlan ? "Cancel subscription" : <>Choose Premium <span aria-hidden="true">→</span></>}
          </button>
          {checkoutError && <p className="premium-plan__checkout-error" role="alert">{checkoutError}</p>}
        </article>
      </div>
      <section className="premium-details" id="premium-details" aria-labelledby="premium-details-title">
        <p className="premium__eyebrow">UPSKILL PREMIUM</p>
        <h2 id="premium-details-title">Premium Plans</h2>
        <p className="premium-details__intro">Unlock personalized admin guidance, AI powered career support, ATS focused CV feedback, and a clear roadmap toward MNC opportunities with Premium.</p>
        <div className="premium-details__grid">
          {premiumFeatures.map((feature, index) => (
            <PremiumFeatureCard feature={feature} index={index} key={feature.title} />
          ))}
        </div>
        <div className="premium-details__bottom">
          <div><h3>Plan and price</h3><p>Premium Career is listed at <strong>₹499 per month</strong>. Review the plan details before choosing whether it fits your needs.</p></div>
          <div><h3>How to get the most from Premium</h3><ol><li>Start by choosing one or two target roles and sharing your goals with the admin team.</li><li>Review your CV, apply the ATS feedback, and use AI assistance to practice role-specific interviews.</li><li>Follow your roadmap in small milestones, then use the MNC openings to focus your applications.</li></ol></div>
        </div>
        <p className="premium-details__note">Premium provides career guidance and preparation tools. Job availability varies, and no feature guarantees an interview, offer, or hiring outcome. Company names shown above are examples only; employers make all hiring decisions.</p>
        <Link className="premium-details__back" to="/freelancer"><span aria-hidden="true">←</span> Back to freelancer dashboard</Link>
      </section>
    </section>
  );
}

export default Premium;
