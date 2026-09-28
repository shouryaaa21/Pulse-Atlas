// Where the backend API lives. Override with NEXT_PUBLIC_API_URL in a
// .env.local file if you run the backend on a different port or host.
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
