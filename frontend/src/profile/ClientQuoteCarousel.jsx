import { useEffect, useState } from "react";
import "./clientQuoteCarousel.css";

const notes = [
  { quote: "The right collaboration starts with a clear brief.", tag: "A better way to hire" },
  { quote: "Bring your next idea to life with the right independent talent.", tag: "Make room for great work" },
  { quote: "Your next project deserves a team that gets it.", tag: "Built around your goals" },
];

export default function ClientQuoteCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % notes.length), 6000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="client-quote" aria-label="Client inspiration" aria-live="polite">
      <div className="client-quote__copy" key={active}>
        <span className="client-quote__tag">{notes[active].tag}</span>
        <blockquote>“{notes[active].quote}”</blockquote>
        <span className="client-quote__signature">— For every client building something new</span>
      </div>
      <div className="client-quote__art" aria-hidden="true">
        <span className="client-quote__spark client-quote__spark--one">✳</span>
        <span className="client-quote__spark client-quote__spark--two">✦</span>
        <span className="client-quote__card client-quote__card--back"><i /><i /><i /></span>
        <span className="client-quote__card client-quote__card--front"><b>Project brief</b><i /><i /><em>Ready to start</em></span>
        <span className="client-quote__check">✓</span>
      </div>
      <div className="client-quote__dots" aria-label={`Quote ${active + 1} of ${notes.length}`}>
        {notes.map((note, index) => <button key={note.tag} type="button" aria-label={`Show quote ${index + 1}`} aria-current={active === index ? "true" : undefined} onClick={() => setActive(index)} />)}
      </div>
    </section>
  );
}
