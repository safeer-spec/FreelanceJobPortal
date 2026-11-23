import { Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import "./cartPage.css";

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main className="cart-page">
        <div className="cart-page__content">
          <p className="cart-page__eyebrow">Your selections</p>
          <h1>Your cart</h1>
          <section className="cart-empty" aria-labelledby="cart-empty-title">
            <div className="cart-empty__icon" aria-hidden="true">
              <svg viewBox="0 0 48 48">
                <path d="M7 10h4l4 23h21l5-16H13" />
                <circle cx="19" cy="39" r="2" />
                <circle cx="34" cy="39" r="2" />
              </svg>
            </div>
            <h2 id="cart-empty-title">Your cart is empty</h2>
            <p>Items you add will appear here.</p>
            <Link className="cart-empty__link" to="/jobs">Browse jobs</Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
