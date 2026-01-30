-- user_profiles 트리거 수정 v3 FINAL (실제 스키마에 맞춤)
-- 테이블: id, username, created_at, updated_at, is_admin (email 없음!)
-- 2025-01-30

-- 1. 기존 트리거 및 함수 제거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. 신규 유저 처리 함수 생성 (실제 스키마에 맞춤)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  username_suffix INTEGER := 0;
  username_exists BOOLEAN;
BEGIN
  -- 이메일에서 기본 사용자명 생성 (@ 앞부분 사용)
  base_username := COALESCE(
    split_part(NEW.email, '@', 1),
    'user_' || substring(NEW.id::text, 1, 8)
  );
  
  final_username := base_username;
  
  -- username 중복 체크 및 번호 붙이기 (윤태일 -> 윤태일1 -> 윤태일2 ...)
  LOOP
    -- 현재 username이 존재하는지 확인
    SELECT EXISTS (
      SELECT 1 FROM public.user_profiles WHERE username = final_username
    ) INTO username_exists;
    
    -- 중복이 없으면 루프 종료
    EXIT WHEN NOT username_exists;
    
    -- 중복이 있으면 번호 증가
    username_suffix := username_suffix + 1;
    final_username := base_username || username_suffix::TEXT;
  END LOOP;
  
  -- user_profiles 테이블에 프로필 생성 (email 컬럼 제외!)
  INSERT INTO public.user_profiles (id, username, is_admin, created_at, updated_at)
  VALUES (
    NEW.id,
    final_username,  -- 중복 처리된 username 사용
    false,
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
  
  -- user_squads 테이블에 빈 스쿼드 생성
  INSERT INTO public.user_squads (
    user_id,
    top_card_instance_id,
    jgl_card_instance_id,
    mid_card_instance_id,
    adc_card_instance_id,
    sup_card_instance_id,
    updated_at
  )
  VALUES (
    NEW.id,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 에러 발생 시 로그 남기고 계속 진행
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. 트리거 생성 (auth.users 테이블에 새 사용자 생성 시)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
