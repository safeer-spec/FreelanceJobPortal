const localApiBase = import.meta.env.VITE_BASE_UTL || "http://localhost:8500/api/v1";

export const API_BASE_URL = (import.meta.env.PROD ? "/api/v1" : localApiBase).replace(/\/+$/, "");
