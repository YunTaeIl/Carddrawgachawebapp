-- 🔍 트리거 실행 후 결과 확인용 쿼리
-- Supabase Dashboard → SQL Editor에서 실행

-- =============================================================================
-- 1️⃣ 트리거 존재 확인
-- =============================================================================
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 결과: trigger_name = 'on_auth_user_created' 나오면 성공 ✅


-- =============================================================================
-- 2️⃣ 함수 존재 확인
-- =============================================================================
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
AND routine_name = 'handle_new_user';

-- 결과: routine_name = 'handle_new_user' 나오면 성공 ✅


-- =============================================================================
-- 3️⃣ user_profiles 스키마 확인
-- =============================================================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 예상 결과:
-- id          | uuid      | NO
-- username    | text      | NO
-- created_at  | timestamp | YES
-- updated_at  | timestamp | YES
-- is_admin    | boolean   | NO


-- =============================================================================
-- 4️⃣ 최근 가입한 유저 5명 확인
-- =============================================================================
SELECT 
  u.email,
  u.created_at as "가입시간",
  p.username as "유저명",
  p.is_admin as "어드민",
  g.currency as "보유RP",
  CASE 
    WHEN p.id IS NULL THEN '❌ user_profiles 없음'
    WHEN g.id IS NULL THEN '❌ user_game_data 없음'
    ELSE '✅ 정상'
  END as "상태"
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
LEFT JOIN user_game_data g ON u.id = g.id
ORDER BY u.created_at DESC
LIMIT 5;

-- 정상: 모든 행의 "상태"가 "✅ 정상"이어야 함


-- =============================================================================
-- 5️⃣ 본인 계정 상세 확인 (이메일 수정 필요!)
-- =============================================================================
DO $$
DECLARE
  my_email TEXT := 'your-email@gmail.com';  -- ⚠️ 여기 수정!
  user_uuid UUID;
  has_profile BOOLEAN;
  has_game_data BOOLEAN;
  has_squad BOOLEAN;
BEGIN
  -- auth.users에서 user_id 찾기
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = my_email;
  
  IF user_uuid IS NULL THEN
    RAISE NOTICE '❌ 이메일 % 로 가입된 계정 없음', my_email;
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ User ID: %', user_uuid;
  
  -- user_profiles 확인
  SELECT EXISTS (SELECT 1 FROM user_profiles WHERE id = user_uuid) INTO has_profile;
  IF has_profile THEN
    RAISE NOTICE '✅ user_profiles 존재';
    -- username 출력
    DECLARE
      uname TEXT;
    BEGIN
      SELECT username INTO uname FROM user_profiles WHERE id = user_uuid;
      RAISE NOTICE '   └─ username: %', uname;
    END;
  ELSE
    RAISE NOTICE '❌ user_profiles 없음 (트리거 실패!)';
  END IF;
  
  -- user_game_data 확인
  SELECT EXISTS (SELECT 1 FROM user_game_data WHERE id = user_uuid) INTO has_game_data;
  IF has_game_data THEN
    RAISE NOTICE '✅ user_game_data 존재';
    -- RP 출력
    DECLARE
      rp INTEGER;
    BEGIN
      SELECT currency INTO rp FROM user_game_data WHERE id = user_uuid;
      RAISE NOTICE '   └─ RP: %', rp;
    END;
  ELSE
    RAISE NOTICE '❌ user_game_data 없음';
  END IF;
  
  -- user_squads 확인
  SELECT EXISTS (SELECT 1 FROM user_squads WHERE user_id = user_uuid) INTO has_squad;
  IF has_squad THEN
    RAISE NOTICE '✅ user_squads 존재';
  ELSE
    RAISE NOTICE '❌ user_squads 없음';
  END IF;
END $$;


-- =============================================================================
-- 6️⃣ username 중복 체크 (중복 있으면 문제!)
-- =============================================================================
SELECT 
  username,
  COUNT(*) as "중복개수"
FROM user_profiles
GROUP BY username
HAVING COUNT(*) > 1;

-- 결과: 아무것도 안 나오면 정상 ✅
-- 결과: 뭔가 나오면 username 중복 있음 ❌


-- =============================================================================
-- 7️⃣ 전체 유저 수 확인
-- =============================================================================
SELECT 
  (SELECT COUNT(*) FROM auth.users) as "auth.users",
  (SELECT COUNT(*) FROM user_profiles) as "user_profiles",
  (SELECT COUNT(*) FROM user_game_data) as "user_game_data",
  (SELECT COUNT(*) FROM user_squads) as "user_squads";

-- 예상: auth.users = user_profiles = user_game_data = user_squads (같은 숫자)
-- 다르면 일부 유저가 누락된 것!
