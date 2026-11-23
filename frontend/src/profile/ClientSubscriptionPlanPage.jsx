import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import ProfileLayout from "./ProfileLayout.jsx";
import "./clientSubscriptionPlan.css";
import { createBillingPortalSession, createCheckoutSession } from "../services/paymentservices.js";
import { getMyProfile } from "../services/profileservices.js";

const planDetails = {
  monthly: {
    title: "Monthly client plan",
    cadence: "Billed monthly",
    summary: "A month-to-month subscription option for clients who prefer a shorter billing period.",
    duration: "One month per billing period",
    price: "₹199",
    period: "/ month",
  },
  yearly: {
    title: "Yearly client plan",
    cadence: "Billed yearly",
    summary: "A yearly subscription option for clients who prefer one annual billing period.",
    duration: "One year per billing period",
    price: "₹2,000",
    period: "/ year",
  },
};

const workspaceFeatures = [
  ["Post and manage jobs", "Create job listings and follow their review status."],
  ["Review freelancer applications", "Open shared resumes and review applications to your jobs."],
  ["Manage hiring decisions", "Approve or reject applications and track work in progress."],
  ["Review submitted work", "Open freelancer submissions and leave feedback when work is delivered."],
];

export default function ClientSubscriptionPlanPage() {
  const { planType } = useParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState({ plan: "free", status: "inactive" });
  const plan = planDetails[planType];
  useEffect(() => {
    let active = true;
    getMyProfile("client").then((profile) => {
      if (active) setAccount({ plan: profile.subscriptionPlan || "free", status: profile.subscriptionStatus || "inactive" });
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  if (!plan) return <Navigate to="/client" replace />;
  const hasActivePlan = ["active", "trialing", "past_due", "unpaid", "incomplete"].includes(account.status);
  const isCurrentPlan = account.plan === `client-${planType}` && hasActivePlan;

  async function startPayment() {
    setError("");
    setLoading(true);
    try {
      const url = hasActivePlan
        ? await createBillingPortalSession("client")
        : await createCheckoutSession("client", planType);
      window.location.assign(url);
    } catch (requestError) {
      setError(requestError.message || "Could not start secure checkout.");
      setLoading(false);
    }
  }

  return (
    <ProfileLayout role="client" title={plan.title}>
      <main className="client-plan-detail">
        <Link className="client-plan-detail__back" to="/client">← Back to client dashboard</Link>
        <section className="client-plan-detail__hero" aria-labelledby="client-plan-detail-title">
          <div>
            <p className="client-job-create__eyebrow">CLIENT SUBSCRIPTION</p>
            <h2 id="client-plan-detail-title">{plan.title}</h2>
            <p>{plan.summary}</p>
          </div>
          <span className="client-plan-detail__status"><i /> Current account: {hasActivePlan ? (planDetails[account.plan.replace("client-", "")]?.title || "Premium") : "Free"}</span>
        </section>

        <div className="client-plan-detail__layout">
          <section className="client-plan-detail__section" aria-labelledby="client-plan-features-title">
            <p className="client-job-create__eyebrow">CLIENT WORKSPACE</p>
            <h3 id="client-plan-features-title">Tools available for your hiring workflow</h3>
            <div className="client-plan-detail__features">
              {workspaceFeatures.map(([title, description], index) => (
                <article key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><h4>{title}</h4><p>{description}</p></div>
                </article>
              ))}
            </div>
          </section>

          <aside className="client-plan-detail__billing" aria-label="Billing details">
            <p className="client-job-create__eyebrow">{plan.cadence}</p>
            <h3>{planType === "monthly" ? "Monthly billing" : "Annual billing"}</h3>
            <p className="client-plan-detail__price">{plan.price}<span>{plan.period}</span></p>
            <dl>
              <div><dt>Billing period</dt><dd>{plan.duration}</dd></div>
              <div><dt>Current plan</dt><dd>{hasActivePlan ? (planDetails[account.plan.replace("client-", "")]?.title || "Premium") : "Free"}</dd></div>
              <div><dt>Payment status</dt><dd>{hasActivePlan ? account.status.replaceAll("_", " ") : "No active subscription"}</dd></div>
            </dl>
            <button type="button" onClick={startPayment} disabled={loading}>{loading ? "Connecting to Stripe…" : hasActivePlan ? (isCurrentPlan ? "Manage subscription" : "Manage current plan") : "Subscribe securely"}</button>
            {error && <p className="client-plan-detail__fineprint" role="alert">{error}</p>}
            {!error && <p className="client-plan-detail__fineprint">Stripe securely processes payment. Your subscription renews at the selected billing interval.</p>}
          </aside>
        </div>

        <section className="client-plan-detail__terms">
          <h3>Before subscribing</h3>
          <p>Your subscription renews automatically at the selected billing interval. You can manage or cancel it through Stripe from this page after subscribing.</p>
        </section>
      </main>
    </ProfileLayout>
  );
}
