import "./foo.css";

import { useState } from "react";

export default function contact() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSent(true);
    event.currentTarget.reset();
  }

  return (
    <main className="info-page">
      <p className="info-eyebrow">CONTACT</p>
      <h1>How can we help?</h1>
      <p className="info-intro">
        Send our team a message and we’ll get back to you.
      </p>

      <form className="contact-form info-panel" onSubmit={handleSubmit}>
        <label>
          Your name
          <input name="name" type="text" autoComplete="name" required />
        </label>

        <label>
          Email address
          <input name="email" type="email" autoComplete="email" required />
        </label>

        <label>
          Message
          <textarea name="message" rows="6" required />
        </label>

        <div>
          <button className="btn" type="submit">
            Send message
          </button>
        </div>
      </form>
    </main>
  );
}
