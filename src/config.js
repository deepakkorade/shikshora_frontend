export const API_URL = import.meta.env.DEV
  ? "http://localhost:8787" // Local Wrangler dev server
  : "https://shikshora-worker.sideways-helicona.workers.dev"; // Production Worker URL
