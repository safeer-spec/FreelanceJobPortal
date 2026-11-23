import { useState } from "react";
import "./header.css";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("search") || "");

  const handleFindWork = () => {
    navigate("/account");
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const searchTerm = query.trim();
    navigate(searchTerm ? `/jobs?search=${encodeURIComponent(searchTerm)}` : "/jobs");
  };

  const handleDemo = () => {
    window.open(
      "https://youtu.be/YOUR_VIDEO_ID",
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="hp" id="Jobs">
      <main className="hp-hero">
        <div className="hp-copy">
          <h1>Explore remote Jobs</h1>
          <p>
            Browse jobs posted on Upwork, or jump right in and create a free
            profile to find the work that you love to do.
          </p>

          <div className="hp-actions">
            <button className="hp-cta" type="button" onClick={handleFindWork}>
              Find work
            </button>

            <button className="hp-demo" type="button" onClick={handleDemo}>
              Watch a demo
            </button>
          </div>
        </div>

        <form className="hp-search" role="search" onSubmit={handleSearch}>
          <div className="hp-search-box">
            <span className="hp-search-icon" aria-hidden="true">
              ⌕
            </span>
            <input
              id="job-search"
              type="search"
              placeholder="Job title, skill, or keyword"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit">Search</button>
          </div>

          <p className="hp-search-hint">
            Try “React developer” or “logo design”
          </p>
        </form>
      </main>
    </div>
  );
}
