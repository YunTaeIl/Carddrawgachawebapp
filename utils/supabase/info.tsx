/* Sanitized for open-source release. Configure values in .env instead. */

const env = import.meta.env

export const projectId = env.VITE_SUPABASE_PROJECT_ID?.trim() || "YOUR_SUPABASE_PROJECT_ID"
export const publicAnonKey = env.VITE_SUPABASE_ANON_KEY?.trim() || "YOUR_SUPABASE_ANON_KEY"
export const functionsBasePath = env.VITE_SUPABASE_FUNCTIONS_BASE_PATH?.trim() || "make-server-ffd115c0"
export const authStorageKey = env.VITE_SUPABASE_AUTH_STORAGE_KEY?.trim() || "sb-legends-manager-auth-token"
