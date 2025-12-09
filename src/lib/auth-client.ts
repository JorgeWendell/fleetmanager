import { createAuthClient } from "better-auth/react";

// Detectar automaticamente a baseURL baseada no ambiente
const getBaseURL = () => {
  if (typeof window === "undefined") {
    return "http://localhost:5200"; // Server-side fallback
  }

  // Client-side: usar a URL atual
  return window.location.origin;
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});
