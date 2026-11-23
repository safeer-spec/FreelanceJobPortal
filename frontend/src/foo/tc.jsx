import "./foo.css"


export default function tc() {
  return (
    <main className="info-page">
      <p className="info-eyebrow">LEGAL</p>
      <h1>Terms and Conditions</h1>
    

      <section className="info-panel">
        <h2>Using UpSkill.io</h2>
        <p>
          Explain who may use the platform, what users must do to keep accounts
          secure, and which activities are prohibited.
        </p>

        <h2>Client and freelancer relationships</h2>
        <p>
          Describe how clients and freelancers use the platform to find and
          manage work, including any applicable platform fees or payment rules.
        </p>

        <h2>Content and accounts</h2>
        <p>
          Explain users’ responsibilities for the content they submit and the
          circumstances in which accounts or content may be restricted.
        </p>

        <h2>Disclaimers and liability</h2>
        <p>
          Add terms that accurately describe the platform’s responsibilities
          and limitations.
        </p>

        <h2>Changes and contact</h2>
        <p>
          Explain how you’ll notify users about material changes. Questions:
          {" "}
          <a href="mailto:support@upskill.io">support@upskill.io</a>
        </p>
      </section>
    </main>
  );
}