import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./lib/theme-provider";

// Default tenant branding - placeholders until client supplies brand assets
// These will be overridden per-tenant via the ThemeProvider branding prop
const defaultBranding = {
  primary: "#1d4ed8", // Blue-600 as placeholder
  accent: "#64748b", // Gray-500 as placeholder
  logo: undefined, // Will be set per-tenant
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      branding={defaultBranding}
      density="default"
    >
      <App />
    </ThemeProvider>
  </StrictMode>,
);