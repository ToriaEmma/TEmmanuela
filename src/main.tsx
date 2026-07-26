import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

document.documentElement.dataset.language = localStorage.getItem("site-language") || "fr";
document.documentElement.classList.toggle("light-site", localStorage.getItem("color-theme") === "light");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
