import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App.tsx";
import "./index.css";
import "./styles/web-view.css";

// Ensure the root element has the correct styles
document.documentElement.style.height = '100%';
document.body.style.height = '100%';

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

// Add touch-action for better scrolling on mobile
document.body.style.touchAction = 'pan-y';

// Add a class to the root element for web view detection
rootElement.classList.add('web-view-app');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
