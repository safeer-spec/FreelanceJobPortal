import "./foo.css";

export default function About() {
  return (
    <main className="info-page about-page">
      <p className="info-eyebrow">ABOUT UPSKILL.IO</p>
      <h1>Great work starts with the right connection.</h1>
      <p className="info-intro">
        UpSkill.io brings businesses and independent professionals together to
        get meaningful work done.
      </p>

      <div className="info-panel about-mission">
        <h2>Our mission</h2>
        <p>
          We make it easier for clients to find skilled freelancers and for
          freelancers to discover opportunities that match their experience.
          Our goal is to make collaboration clear, accessible, and rewarding.
        </p>
      </div>
    </main>
  );
}