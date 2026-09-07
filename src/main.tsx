import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

window.addEventListener("load", () => {
  setTimeout(() => {
    const veil = document.getElementById("veil");
    if (veil) veil.style.opacity = "0";
  }, 300);
});