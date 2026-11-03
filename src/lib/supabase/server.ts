import { createClient } from "@supabase/supabase-js";

/**
 * 서버(Route Handler) 전용 Supabase 클라이언트.
 * 로그인 기능이 없는 개인 프로젝트이므로 anon key를 사용한다.
 * 필요 시 SUPABASE_SERVICE_ROLE_KEY로 교체해 RLS를 우회할 수 있다.
 */
export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요."
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}
