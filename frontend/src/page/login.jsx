import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { loginAccount } from "../services/authservices";
import "./page.css";

const ROLES = ["freelancer", "client", "admin"];
const ROLE_DESTINATIONS = { freelancer: "/freelancer", client: "/client", admin: "/admin" };

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get("role");
  const role = ROLES.includes(requestedRole) ? requestedRole : "freelancer";
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setSubmitting(true);
    try {
      const result = await loginAccount(role, {
        email: form.get("identity"),
        password: form.get("password"),
      });
      if (result.role !== role) throw new Error("The server returned a different account role.");

      const account = result[role];
      if (!account) throw new Error("The server did not return the signed-in account.");

      sessionStorage.setItem(
        "jobportal.profile",
        JSON.stringify({ ...account, role }),
      );
      window.dispatchEvent(new Event("jobportal:profile-updated"));
      navigate(ROLE_DESTINATIONS[role], { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <header className="login-heading">Log in to Upwork</header>
        <a className="google-button" href="https://workspace.google.com/intl/en_in/gmail/">
          <span className="google-mark" aria-hidden="true">G</span>
          Continue with Google
        </a>
        <div className="login-divider">
          <span>or sign in with email or phone</span>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="login-identity">Email or phone number</label>
          <input id="login-identity" name="identity" type="text" placeholder="Email or phone number" autoComplete="username" required />
          <div className="password-label-row">
            <label htmlFor="login-password">Password</label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <input id="login-password" name="password" type="password" placeholder="Enter your password" autoComplete="current-password" required />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="login-submit" type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="signup-prompt">
          Don’t have an account? <Link to={"/signup?role=" + role}>Create one</Link>
        </p>
      </section>
    </main>
  );
}
