# 🔧 Supabase 마이그레이션 실행 가이드

## ⚠️ 중요: Google OAuth 로그인 문제 해결

현재 Google OAuth 로그인 후 유저가 DB에 생성되지 않는 문제가 있습니다.
이는 트리거 함수가 존재하지 않는 컬럼(`avatar_url`)을 참조하기 때문입니다.

## 🚀 해결 방법

### 1️⃣ Supabase Dashboard에서 마이그레이션 실행

다음 2개의 SQL 파일을 **순서대로** 실행해주세요:

#### Step 1: 스키마 수정
파일: `20250130_fix_user_profiles_schema.sql`

```sql
-- user_profiles 테이블에 email 컬럼 추가, avatar_url 제거
```

**실행 방법:**
1. Supabase Dashboard → SQL Editor
2. `20250130_fix_user_profiles_schema.sql` 내용 복사
3. 실행 (Run)

#### Step 2: 트리거 수정
파일: `20250130_fix_user_trigger.sql`

```sql
-- 트리거 함수 재생성 (avatar_url 제거, email/is_admin 추가)
```

**실행 방법:**
1. Supabase Dashboard → SQL Editor
2. `20250130_fix_user_trigger.sql` 내용 복사
3. 실행 (Run)

### 2️⃣ 실행 확인

마이그레이션 실행 후 트리거가 정상 작동하는지 확인:

```sql
-- 트리거 확인
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 함수 확인
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
```

### 3️⃣ 테스트

1. 기존 테스트 계정으로 Google 로그인
2. 또는 새 Google 계정으로 회원가입
3. 다음 쿼리로 유저 데이터 확인:

```sql
-- 본인 유저 ID 확인 (Supabase Dashboard → Authentication → Users)
SELECT * FROM auth.users WHERE email = 'your-email@gmail.com';

-- user_profiles 확인
SELECT * FROM user_profiles WHERE id = 'YOUR_USER_ID';

-- user_game_data 확인
SELECT * FROM user_game_data WHERE id = 'YOUR_USER_ID';

-- user_squads 확인
SELECT * FROM user_squads WHERE user_id = 'YOUR_USER_ID';
```

## 📊 트리거 동작 방식

```
Google OAuth 로그인
       ↓
auth.users에 INSERT
       ↓
🔥 on_auth_user_created 트리거 발동
       ↓
handle_new_user() 함수 실행
       ↓
3개 테이블 자동 생성:
  ├─ user_profiles (email, username, is_admin)
  ├─ user_game_data (20,000 RP 지급)
  └─ user_squads (빈 스쿼드)
```

## 🎯 최종 스키마

### user_profiles
- `id` (UUID, PK)
- `email` (TEXT) ✅ **추가됨**
- `username` (TEXT, UNIQUE)
- `is_admin` (BOOLEAN, DEFAULT false)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### user_game_data
- `id` (UUID, PK)
- `currency` (INTEGER, DEFAULT 20000)
- `shards` (INTEGER)
- `s_pity_stack` (INTEGER)
- `a_pity_stack` (INTEGER)
- `total_pulls` (INTEGER)
- `last_check_in` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### user_squads
- `id` (UUID, PK)
- `user_id` (UUID, UNIQUE FK)
- `top_card_instance_id` (TEXT)
- `jgl_card_instance_id` (TEXT)
- `mid_card_instance_id` (TEXT)
- `adc_card_instance_id` (TEXT)
- `sup_card_instance_id` (TEXT)
- `updated_at` (TIMESTAMP)

## 🔥 문제 해결 완료!

마이그레이션 실행 후:
✅ Google OAuth 로그인 시 자동으로 유저 생성
✅ 초기 자금 20,000 RP 지급
✅ 프로필, 게임 데이터, 스쿼드 자동 생성

---

## 📝 참고사항

- 기존에 만든 `/init-user` API는 트리거와 중복되므로 **백업용**으로만 사용
- 트리거가 정상 작동하면 API 호출 없이도 자동으로 유저 생성됨
- 마이그레이션은 **idempotent** 설계 (여러 번 실행해도 안전함)
