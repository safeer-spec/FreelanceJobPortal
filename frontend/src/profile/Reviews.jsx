import { useEffect, useState } from "react";
import { getClientReviews, getFreelancerReviews } from "../services/jobservices";
import "./reviews.css";

export default function Reviews({ role }) {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = role === "client" ? getClientReviews : getFreelancerReviews;
    load()
      .then((result) => { if (active) setReviews(Array.isArray(result) ? result : []); })
      .catch((requestError) => { if (active) setError(requestError.message || "Could not load reviews."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [role]);

  const isClient = role === "client";

  return (
    <section className="account-reviews" aria-labelledby="account-reviews-title">
      <div className="account-reviews__heading">
        <div>
          <p className="profile-layout__eyebrow">Verified work feedback</p>
          <h2 id="account-reviews-title">{isClient ? "Reviews you posted" : "Client reviews"}</h2>
        </div>
      </div>
      {loading && <p className="account-reviews__empty">Loading reviews…</p>}
      {error && <p className="account-reviews__empty" role="alert">{error}</p>}
      {!loading && !error && reviews.length === 0 && (
        <p className="account-reviews__empty">{isClient ? "Reviews you post for submitted work will appear here." : "Reviews from clients you have completed work for will appear here."}</p>
      )}
      <div className="account-reviews__list">
        {reviews.map((item) => (
          <article className="account-review" key={item._id}>
            <div className="account-review__top">
              <div>
                <h3>{item.job?.title || "Completed work"}</h3>
                <p>{isClient ? `Freelancer: ${item.freelancer?.name || "Freelancer"}` : `Reviewed by ${item.review?.client?.name || "Verified client"}`}</p>
              </div>
              <span className="account-review__stars" aria-label={`${item.review?.rating || 0} out of 5 stars`}>
                {"★".repeat(item.review?.rating || 0)}{"☆".repeat(5 - (item.review?.rating || 0))}
              </span>
            </div>
            <p className="account-review__comment">{item.review?.comment}</p>
            {item.review?.createdAt && <small>{new Date(item.review.createdAt).toLocaleDateString()}</small>}
          </article>
        ))}
      </div>
    </section>
  );
}
