/**
 * API base URL for all backend requests.
 * - Development: empty string (Vite proxy handles routing)
 * - Production:  full Cloudflare Tunnel URL from VITE_API_URL
 */
const API_BASE = import.meta.env.VITE_API_URL || '';

export default API_BASE;
