# 🚀 빠른 해결 가이드 (Google OAuth 로그인 문제)

## 🔥 증상
- Google 로그인 후 `auth.users`에는 추가됨 ✅
- `user_game_data`에도 생성됨 ✅
- **`user_profiles`에는 생성 안 됨** ❌

## 💊 해결책 (2단계)

### 1️⃣ Supabase Dashboard 접속
https://supabase.com/dashboard → 프로젝트 선택 → **SQL Editor**

### 2️⃣ 다음 SQL 순서대로 실행

#### ✅ Step 1: 스키마 수정
```sql
-- 파일: 20250130_fix_user_profiles_schema.sql
-- (해당 파일 내용 전체 복사해서 실행)
```

#### ✅ Step 2: 트리거 수정
```sql
-- 파일: 20250130_fix_user_trigger_v2.sql
-- (해당 파일 내용 전체 복사해서 실행)
```

### 3️⃣ 확인
```sql
-- 파일: DEBUG_CHECK_TRIGGER.sql 실행
-- 트리거/함수 존재 확인
```

---

## 📋 체크리스트

마이그레이션 실행 후:

- [ ] 트리거 `on_auth_user_created` 존재 확인
- [ ] 함수 `handle_new_user` 존재 확인
- [ ] `user_profiles` 테이블에 `email` 컬럼 있음
- [ ] `user_profiles` 테이블에 `avatar_url` 컬럼 **없음**
- [ ] Google 로그인 테스트
- [ ] `user_profiles` 자동 생성 확인

---

## 🎯 주요 수정 내용

### Before (문제)
```sql
-- 트리거 함수
INSERT INTO user_profiles (id, username, avatar_url, ...)  -- ❌ avatar_url 없음
VALUES (NEW.id, '윤태일', ...);  -- ❌ username 중복 시 실패
```

### After (해결)
```sql
-- 트리거 함수
-- username 중복 처리 로직 추가
LOOP
  SELECT EXISTS (SELECT 1 FROM user_profiles WHERE username = final_username);
  -- "윤태일" 존재 → "윤태일1" 시도 → "윤태일2" ...
END LOOP;

INSERT INTO user_profiles (id, email, username, is_admin, ...)  -- ✅ email 추가
VALUES (NEW.id, NEW.email, '윤태일1', false, ...);  -- ✅ 중복 없는 username
```

---

## 🐛 문제 발생 시

### 문제: 여전히 user_profiles 생성 안 됨
**원인:** 트리거가 실행되지 않음

**해결:**
1. `DEBUG_CHECK_TRIGGER.sql` 실행
2. 트리거/함수 존재 확인
3. 없으면 `20250130_fix_user_trigger_v2.sql` 다시 실행

### 문제: "column avatar_url does not exist" 에러
**원인:** 스키마 마이그레이션 미실행

**해결:**
1. `20250130_fix_user_profiles_schema.sql` 먼저 실행
2. 그 다음 `20250130_fix_user_trigger_v2.sql` 실행

### 문제: username 여전히 중복 에러
**원인:** 구 버전 트리거 사용 중

**해결:**
1. `20250130_fix_user_trigger_v2.sql` 실행 (최신 버전)
2. **v2**가 아닌 파일 사용하지 말 것!

---

## 📞 최종 확인

```sql
-- 본인 이메일로 테스트
SELECT 
  u.email,
  p.username,
  p.is_admin,
  g.currency,
  s.user_id
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
LEFT JOIN user_game_data g ON u.id = g.id
LEFT JOIN user_squads s ON u.id = s.user_id
WHERE u.email = 'your-email@gmail.com';
```

**정상 결과:**
- `email`: ✅ 있음
- `username`: ✅ 있음 (윤태일1 등)
- `is_admin`: ✅ false
- `currency`: ✅ 20000
- `user_id`: ✅ 있음

**비정상 결과:**
- `username`: ❌ NULL → 트리거 실패

---

## ✅ 완료!

이제 Google OAuth 로그인 시:
- `user_profiles` 자동 생성 ✅
- username 중복 시 번호 자동 추가 (윤태일1, 윤태일2...) ✅
- 초기 자금 20,000 RP 지급 ✅
- 빈 스쿼드 자동 생성 ✅
