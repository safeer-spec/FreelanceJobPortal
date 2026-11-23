import "./foo.css"

export default function privacyPolicy() {
  return (
    <main className="info-page">
      <p className="info-eyebrow">LEGAL</p>
      <h1>Privacy Policy</h1>
    

      <section className="info-panel">
        <h2>Information we collect</h2>
        <p>
          Describe the information UpSkill.io collects, such as account details,
          profile information, messages, and usage data. Include only data your
          service actually collects.
        </p>

        <h2>How we use information</h2>
        <p>
          Explain how information is used to operate the platform, support
          accounts, connect clients and freelancers, and improve the service.
        </p>

        <h2>Sharing and retention</h2>
        <p>
          Describe when information is shared, which service providers process
          it, and how long it is kept.
        </p>

        <h2>Your choices and rights</h2>
        <p>
          Explain how users can access, correct, or request deletion of their
          information, and how they can contact you with privacy questions.
        </p>

        <h2>Contact</h2>
        <p>
          Privacy questions: <a href="mailto:privacy@upskill.io">privacy@upskill.io</a>
        </p>
      </section>
    </main>
  );
}