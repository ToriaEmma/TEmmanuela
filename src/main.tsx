import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

document.documentElement.dataset.language = localStorage.getItem("site-language") || "fr";
// Le site est en mode sombre, sans bascule : on retire la classe heritee des
// visites precedentes, sinon un ancien "light" reste colle au navigateur.
document.documentElement.classList.remove("light-site");
localStorage.removeItem("color-theme");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
