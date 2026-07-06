import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const isIgnorableLiveAvatarError = (value: unknown) => {
  const text =
    typeof value === "string"
      ? value
      : (value as any)?.message || (value as any)?.toString?.() || "";
  return String(text).toLowerCase().includes("session not found");
};

window.addEventListener(
  "unhandledrejection",
  (event) => {
    if (isIgnorableLiveAvatarError(event.reason)) {
      event.preventDefault();
    }
  },
  { capture: true },
);

window.addEventListener(
  "error",
  (event) => {
    if (isIgnorableLiveAvatarError(event.error || event.message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },
  { capture: true },
);

createRoot(document.getElementById("root")!).render(<App />);
