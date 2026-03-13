import axios from "axios";
import { env } from "@/env";

/**
 * Server-only Axios instance for Next.js route handlers → backend communication.
 * Uses BACKEND_API_URL (no NEXT_PUBLIC_ prefix — never exposed to the browser).
 */
const serverAxios = axios.create({
  baseURL: env.BACKEND_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default serverAxios;
