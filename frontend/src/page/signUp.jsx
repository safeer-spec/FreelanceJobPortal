import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { registerAccount } from "../services/authservices";
import "./page.css";

const ROLES = ["freelancer", "client", "admin"];

export default function Signup() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");
  const passwordsMatch = !confirmPassword || password === confirmPassword;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!ROLES.includes(role)) {
      setError("Choose an account type before creating an account.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const form = new FormData(event.currentTarget);
    setError("");
    setSubmitting(true);
    try {
      await registerAccount(role, {
        name: (form.get("firstName") + " " + form.get("lastName")).trim(),
        email: form.get("email"),
        phone: form.get("phone"),
        password,
        confirmpassword: confirmPassword,
      });
      navigate("/login?role=" + role, {
        replace: true,
        state: { message: "Account created. Please sign in." },
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!ROLES.includes(role)) {
    return (
      <main className="signup-page">
        <section className="signup-card">
          <header className="signup-heading">Welcome to Upwork</header>
          <p className="form-error" role="alert">Choose an account type to continue.</p>
          <p className="signup-prompt"><Link to="/account">Choose account type</Link></p>
        </section>
      </main>
    );
  }

  return (
    <main className="signup-page">
      <section className="signup-card">
        <header className="signup-heading">Welcome to Upwork</header>
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="name-row">
            <label>
              First name
              <input type="text" name="firstName" placeholder="First name" autoComplete="given-name" required />
            </label>
            <label>
              Last name
              <input type="text" name="lastName" placeholder="Last name" autoComplete="family-name" required />
            </label>
          </div>
          <label>
            Phone number
            <input type="tel" name="phone" placeholder="Enter your phone number" autoComplete="tel" required />
          </label>
          <label>
            Email address
            <input type="email" name="email" placeholder="you@example.com" autoComplete="email" required />
          </label>
          <label>
            Password
            <input type="password" name="password" placeholder="Create a password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
          </label>
          <label>
            Confirm password
            <input type="password" name="confirmPassword" placeholder="Enter your password again" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} aria-invalid={!passwordsMatch} aria-describedby="password-message" required />
          </label>
          {!passwordsMatch && <p className="form-error" id="password-message">Passwords do not match.</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <label className="terms-label">
            <input type="checkbox" name="terms" required />
            <span>I agree to the <Link to="/terms">Terms and Conditions</Link></span>
          </label>
          <button type="submit" disabled={!passwordsMatch || submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
          <p className="wl-login">
            Already have an account? <Link to={"/login?role=" + role}>Log in</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
