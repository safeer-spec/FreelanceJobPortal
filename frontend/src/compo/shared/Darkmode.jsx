import { useEffect, useState } from "react";
import "./d.css"

export default function Darkmode() {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const theme = isDark ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [isDark]);

  return (
    <label
      className="theme-switch"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="theme-switch__icon" aria-hidden="true">☀</span>
      <input
        className="theme-switch__input"
        type="checkbox"
        role="switch"
        aria-label="Dark mode"
        checked={isDark}
        onChange={(event) => setIsDark(event.target.checked)}
      />
      <span className="theme-switch__track" aria-hidden="true">
        <span className="theme-switch__thumb" />
      </span>
      <span className="theme-switch__icon" aria-hidden="true">☾</span>
    </label>
  );
}