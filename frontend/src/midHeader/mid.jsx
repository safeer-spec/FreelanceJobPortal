import "./mid.css";
import c1 from "../assets/c1.png";
import c2 from "../assets/c2.webp";
import d from "../assets/d.jpg";
import p from "../assets/p.jpg";

const photos = [
  {
    src: c1,
    alt: "Modern creative workspace",
    className: "hero-photo hero-photo--left",
  },
  {
    src: c2,
    alt: "Colorful graphic design artwork",
    className: "hero-photo hero-photo--top",
  },
  {
    src: d,
    alt: "Creative office interior",
    className: "hero-photo hero-photo--bottom",
  },
   {
    src: p,
    alt: "Creative office interior",
    className: "hero-photo hero-photo--right",
  },
  
];
export default function mid() {
  return (
    <section className="freelance-hero">
      <div className="freelance-hero__content">
        <p className="freelance-hero__eyebrow">THE FREELANCE NETWORK</p>

        <h1>
          ONE STOP SOLUTION
          <br />
          FOR <span>FREELANCERS</span>
        </h1>

        <p className="freelance-hero__subtitle">
          Find the best freelancers for any job online
        </p>
      </div>

      <div
        className="freelance-hero__gallery"
        aria-label="Freelance work examples"
      >
        <div className="freelance-hero__orbit" />
        {photos.map((photo) => (
          <img
            key={photo.className}
            className={photo.className}
            src={photo.src}
            alt={photo.alt}
          />
        ))}
      </div>
    </section>
  );
}

