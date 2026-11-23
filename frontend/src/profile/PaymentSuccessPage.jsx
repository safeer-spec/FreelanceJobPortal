import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import ProfileLayout from "./ProfileLayout.jsx";
import { getMyProfile } from "../services/profileservices.js";
import { verifyCheckoutSession } from "../services/paymentservices.js";
import "./paymentResult.css";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get("role");
  const sessionId = searchParams.get("session_id");
  const [state, setState] = useState({ loading: true, purchase: null, error: "" });

  useEffect(() => {
    let active = true;
    if (!["client", "freelancer"].includes(role) || !sessionId) {
      setState({ loading: false, purchase: null, error: "We couldn’t verify this purchase. Return to your dashboard and check your plan status." });
      return () => { active = false; };
    }

    verifyCheckoutSession(role, sessionId)
      .then(async (purchase) => {
        try {
          const profile = await getMyProfile(role);
          sessionStorage.setItem("jobportal.profile", JSON.stringify({ ...profile, role }));
          window.dispatchEvent(new Event("jobportal:profile-updated"));
        } catch {
          // A verified Stripe purchase still gets its success confirmation if profile refresh is unavailable.
        }
        if (active && role === "freelancer") {
          navigate("/premium?welcome=1", { replace: true });
          return;
        }
        if (active) setState({ loading: false, purchase, error: "" });
      })
      .catch((error) => {
        if (active) setState({ loading: false, purchase: null, error: error.message || "We couldn’t verify this purchase." });
      });

    return () => { active = false; };
  }, [navigate, role, sessionId]);

  if (!["client", "freelancer"].includes(role)) return <Navigate to="/" replace />;
  const destination = role === "client" ? "/client" : "/freelancer";

  return (
    <ProfileLayout role={role} title="Purchase status">
      <main className="payment-result" aria-live="polite">
        {state.loading ? (
          <p className="payment-result__loading">Confirming your payment with Stripe…</p>
        ) : state.purchase ? (
          <section className="payment-result__card payment-result__card--success">
            <span className="payment-result__icon" aria-hidden="true">✓</span>
            <p className="payment-result__eyebrow">PAYMENT CONFIRMED</p>
            <h2>Purchase successful</h2>
            <p>Your <strong>{state.purchase.plan}</strong> subscription is active.</p>
            <p className="payment-result__amount">₹{state.purchase.amount.toLocaleString("en-IN")} / {state.purchase.interval}</p>
            <Link to={destination}>Continue to your dashboard <span aria-hidden="true">→</span></Link>
          </section>
        ) : (
          <section className="payment-result__card">
            <span className="payment-result__icon payment-result__icon--error" aria-hidden="true">!</span>
            <p className="payment-result__eyebrow">PAYMENT STATUS</p>
            <h2>We couldn’t confirm your purchase</h2>
            <p>{state.error}</p>
            <Link to={destination}>Return to your dashboard</Link>
          </section>
        )}
      </main>
    </ProfileLayout>
  );
}
