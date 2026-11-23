import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./clientSubscription.css";
import { createBillingPortalSession, createCheckoutSession } from "../services/paymentservices.js";
import { getMyProfile } from "../services/profileservices.js";

const plans = [
  { id: "monthly", title: "Monthly plan", billing: "Billed monthly", term: "Flexible month-to-month access", price: "₹199", period: "/ month" },
  { id: "yearly", title: "Yearly plan", billing: "Billed yearly", term: "One yearly subscription term", price: "₹2,000", period: "/ year" },
];

export default function ClientSubscription() {
  const [loadingPlan, setLoadingPlan] = useState("");
  const [error, setError] = useState("");
  const [account, setAccount] = useState({ plan: "free", status: "inactive" });
  const hasSubscription = ["active", "trialing", "past_due", "unpaid", "incomplete"].includes(account.status);

  useEffect(() => {
    let active = true;
    getMyProfile("client").then((profile) => {
      if (active) setAccount({ plan: profile.subscriptionPlan || "free", status: profile.subscriptionStatus || "inactive" });
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  async function subscribe(planId) {
    setError("");
    setLoadingPlan(planId);
    try {
      const checkoutUrl = await createCheckoutSession("client", planId);
      window.location.assign(checkoutUrl);
    } catch (requestError) {
      setError(requestError.message || "Could not start secure checkout.");
      setLoadingPlan("");
    }
  }

  async function manageSubscription() {
    setError("");
    setLoadingPlan("manage");
    try {
      const portalUrl = await createBillingPortalSession("client");
      window.location.assign(portalUrl);
    } catch (requestError) {
      setError(requestError.message || "Could not open subscription management.");
      setLoadingPlan("");
    }
  }

  return (
    <section className="client-subscription" aria-labelledby="client-subscription-title">
      <div className="client-subscription__heading">
        <div>
          <p className="client-job-create__eyebrow">Client plans</p>
          <h2 id="client-subscription-title">Choose a subscription</h2>
          <p>Compare monthly and yearly billing options for your client account.</p>
        </div>
        <span className="client-subscription__current"><span /> Current plan: {hasSubscription ? (plans.find((plan) => `client-${plan.id}` === account.plan)?.title || "Premium") : "Free"}</span>
      </div>

      <div className="client-subscription__plans">
        {plans.map((plan) => (
          <article className="client-subscription__plan" key={plan.id}>
            <span className="client-subscription__billing">{plan.billing}</span>
            <h3>{plan.title}</h3>
            <p>{plan.term}</p>
            <strong className="client-subscription__price">{plan.price}<span>{plan.period}</span></strong>
            <div className="client-subscription__actions">
              <Link className="client-subscription__view" to={`/client/plans/${plan.id}`}>View details</Link>
              <button className="client-subscription__subscribe" type="button" disabled={Boolean(loadingPlan)} onClick={() => hasSubscription ? manageSubscription() : subscribe(plan.id)}>
                {loadingPlan ? "Connecting…" : hasSubscription ? "Manage subscription" : <>Subscribe <span aria-hidden="true">→</span></>}
              </button>
            </div>
          </article>
        ))}
      </div>

      {error ? <p className="client-subscription__notice" role="alert">{error}</p> : <p className="client-subscription__notice">Secure checkout is provided by Stripe. Your chosen plan renews at the displayed billing interval.</p>}
    </section>
  );
}
