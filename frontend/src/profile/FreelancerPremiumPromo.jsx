import { Link } from "react-router-dom";
import "./freelancerPremiumPromo.css";

export default function FreelancerPremiumPromo() {
  return (
    <aside className="freelancer-premium-promo" aria-labelledby="freelancer-premium-title">
      <div>
        <p className="freelancer-premium-promo__eyebrow">UPSKILL PREMIUM</p>
        <h2 id="freelancer-premium-title">Get focused support for your next career move</h2>
        <p>Explore career direction, resume feedback, interview practice, and opportunity alerts.</p>
      </div>
      <Link className="freelancer-premium-promo__button" to="/premium">View Premium <span aria-hidden="true">→</span></Link>
    </aside>
  );
}
