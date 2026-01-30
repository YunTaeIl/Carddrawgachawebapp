-- 트리거 및 함수 상태 확인용 쿼리
-- Supabase Dashboard → SQL Editor에서 실행

-- 1️⃣ 트리거 존재 확인
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 결과: trigger_name이 'on_auth_user_created'이면 트리거 존재 ✅


-- 2️⃣ 함수 존재 확인
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public' 
AND routine_name = 'handle_new_user';

-- 결과: routine_name이 'handle_new_user'이면 함수 존재 ✅


-- 3️⃣ user_profiles 스키마 확인
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 필수 컬럼: id, email, username, is_admin, created_at, updated_at
-- avatar_url이 있으면 안 됨 ❌


-- 4️⃣ 특정 유저의 데이터 확인 (이메일로 검색)
-- ⚠️ 본인 이메일로 변경하세요!
DO $$
DECLARE
  target_email TEXT := 'your-email@gmail.com';  -- 여기 수정!
  user_uuid UUID;
BEGIN
  -- auth.users에서 user_id 찾기
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = target_email;
  
  IF user_uuid IS NULL THEN
    RAISE NOTICE '❌ User not found in auth.users for email: %', target_email;
  ELSE
    RAISE NOTICE '✅ User ID: %', user_uuid;
    
    -- user_profiles 확인
    IF EXISTS (SELECT 1 FROM user_profiles WHERE id = user_uuid) THEN
      RAISE NOTICE '✅ user_profiles exists';
    ELSE
      RAISE NOTICE '❌ user_profiles NOT found';
    END IF;
    
    -- user_game_data 확인
    IF EXISTS (SELECT 1 FROM user_game_data WHERE id = user_uuid) THEN
      RAISE NOTICE '✅ user_game_data exists';
    ELSE
      RAISE NOTICE '❌ user_game_data NOT found';
    END IF;
    
    -- user_squads 확인
    IF EXISTS (SELECT 1 FROM user_squads WHERE user_id = user_uuid) THEN
      RAISE NOTICE '✅ user_squads exists';
    ELSE
      RAISE NOTICE '❌ user_squads NOT found';
    END IF;
  END IF;
END $$;


-- 5️⃣ username 중복 확인
SELECT 
  username,
  COUNT(*) as count
FROM user_profiles
GROUP BY username
HAVING COUNT(*) > 1;

-- 결과: 비어있으면 중복 없음 ✅


-- 6️⃣ 최근 가입한 유저 5명 확인
SELECT 
  u.email,
  u.created_at as auth_created,
  p.username,
  p.created_at as profile_created,
  g.currency,
  g.created_at as game_data_created
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
LEFT JOIN user_game_data g ON u.id = g.id
ORDER BY u.created_at DESC
LIMIT 5;

-- auth_created는 있는데 profile_created가 NULL이면 트리거 실패 ❌
