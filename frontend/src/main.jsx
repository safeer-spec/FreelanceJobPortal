import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { installSiteTranslations } from "./services/language.js";

const savedTheme = localStorage.getItem("theme");
document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light";
installSiteTranslations();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
