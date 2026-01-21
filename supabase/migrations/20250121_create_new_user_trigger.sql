-- 회원가입 시 자동으로 유저 데이터 생성 트리거
-- 2025-01-21

-- 1. 기존 트리거 제거 (있다면)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. user_game_data 테이블에 last_check_in 컬럼 추가 (없는 경우)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_game_data' 
    AND column_name = 'last_check_in'
  ) THEN
    ALTER TABLE public.user_game_data 
    ADD COLUMN last_check_in TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 3. 신규 유저 처리 함수 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_username TEXT;
BEGIN
  -- 이메일에서 사용자명 생성 (@ 앞부분 사용)
  default_username := COALESCE(
    split_part(NEW.email, '@', 1),
    'user_' || substring(NEW.id::text, 1, 8)
  );
  
  -- user_profiles 테이블에 프로필 생성
  INSERT INTO public.user_profiles (id, username, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    default_username,
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- user_game_data 테이블에 게임 데이터 생성 (20,000 RP 지급)
  INSERT INTO public.user_game_data (
    id,
    currency,
    shards,
    s_pity_stack,
    a_pity_stack,
    total_pulls,
    last_check_in,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    20000,  -- 회원가입 시 20,000 RP 지급
    0,
    0,
    0,
    0,
    NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 트리거 생성 (auth.users 테이블에 새 사용자 생성 시)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();