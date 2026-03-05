import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./ai-roadmap.jsx";
import { ThemeProvider } from "./ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
