// Supabase 프로젝트 정보
// 공개 저장소용으로 민감/운영 값은 환경 변수에서 읽습니다.

const env = import.meta.env;

export const projectId = env.VITE_SUPABASE_PROJECT_ID?.trim() || "YOUR_SUPABASE_PROJECT_ID";
export const publicAnonKey = env.VITE_SUPABASE_ANON_KEY?.trim() || "YOUR_SUPABASE_ANON_KEY";
export const functionsBasePath = env.VITE_SUPABASE_FUNCTIONS_BASE_PATH?.trim() || "make-server-ffd115c0";
export const authStorageKey = env.VITE_SUPABASE_AUTH_STORAGE_KEY?.trim() || "sb-legends-manager-auth-token";
