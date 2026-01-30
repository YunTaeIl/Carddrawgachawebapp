# 🚨 Google OAuth 로그인 문제 즉시 해결

## 증상
- Google 로그인 → `auth.users`에 추가됨 ✅
- `user_game_data` 생성됨 ✅
- **`user_profiles` 생성 안 됨** ❌

## 원인
트리거가 존재하지 않는 `email` 컬럼을 INSERT하려고 해서 실패

**실제 테이블:**
```sql
user_profiles (
  id,
  username,    -- ⚠️ UNIQUE 제약
  created_at,
  updated_at,
  is_admin
)
-- email 컬럼 없음!
```

**기존 트리거:**
```sql
INSERT INTO user_profiles (id, email, username, ...)  -- ❌ email 컬럼 없음!
```

---

## ✅ 해결 방법 (1분 소요)

### 1️⃣ Supabase Dashboard 접속
https://supabase.com/dashboard → **프로젝트 선택** → **SQL Editor**

### 2️⃣ 파일 실행
**파일:** `/supabase/migrations/EXECUTE_THIS.sql`

1. 파일 내용 **전체 복사**
2. SQL Editor에 **붙여넣기**
3. **Run** 버튼 클릭

**끝!** 🎉

### 3️⃣ 확인
**파일:** `/supabase/migrations/CHECK_RESULT.sql`

1. 파일 내용 **전체 복사**
2. SQL Editor에 **붙여넣기**
3. **Run** 버튼 클릭
4. 결과 확인:
   - 트리거 존재: ✅
   - 함수 존재: ✅
   - user_profiles 스키마: ✅

---

## 🧪 테스트

### 방법 1: 기존 계정 로그인
1. 앱에서 **Google 로그인**
2. `CHECK_RESULT.sql` 실행
3. 본인 이메일로 확인 (쿼리 5️⃣)

### 방법 2: 새 계정 가입
1. Chrome 시크릿 모드
2. 다른 Google 계정으로 가입
3. `CHECK_RESULT.sql` 실행

---

## 📊 수정된 트리거 동작

```
Google 로그인: yuntaeil@gmail.com
       ↓
auth.users에 INSERT
       ↓
🔥 트리거 발동
       ↓
username 생성: "yuntaeil"
       ↓
중복 체크:
  "윤태일" 존재? YES → "윤태일1"
  "윤태일1" 존재? NO → 확정 ✅
       ↓
user_profiles INSERT:
  ├─ id: uuid
  ├─ username: "윤태일1"  ✅
  ├─ is_admin: false
  ├─ created_at: NOW()
  └─ updated_at: NOW()
       ↓
user_game_data INSERT:
  ├─ currency: 20000 RP ✅
  └─ ...
       ↓
user_squads INSERT:
  └─ 빈 스쿼드 ✅
```

---

## 🐛 문제 발생 시

### "user_profiles 여전히 생성 안 됨"
1. `CHECK_RESULT.sql` 쿼리 1️⃣ 실행 → 트리거 존재 확인
2. 없으면 `EXECUTE_THIS.sql` 다시 실행

### "함수 없음" 에러
1. `EXECUTE_THIS.sql` 전체 실행 (부분 실행 금지!)

### "username 중복" 에러
1. `CHECK_RESULT.sql` 쿼리 6️⃣ 실행 → 중복 확인
2. 중복 있으면 수동 수정:
   ```sql
   UPDATE user_profiles 
   SET username = username || (SELECT COUNT(*) FROM user_profiles WHERE username LIKE '윤태일%')
   WHERE username = '윤태일' AND id != (SELECT id FROM user_profiles WHERE username = '윤태일' LIMIT 1);
   ```

---

## ✅ 최종 확인

```sql
-- 본인 이메일로 확인
SELECT 
  u.email,
  p.username,      -- ✅ 있어야 함
  p.is_admin,      -- ✅ false
  g.currency,      -- ✅ 20000
  s.user_id        -- ✅ 있어야 함
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
LEFT JOIN user_game_data g ON u.id = g.id
LEFT JOIN user_squads s ON u.id = s.user_id
WHERE u.email = 'your-email@gmail.com';
```

**정상 결과:**
- `username`: 윤태일1 (또는 윤태일2, 윤태일3...)
- `is_admin`: false
- `currency`: 20000
- `user_id`: uuid 값

**비정상 결과:**
- `username`: NULL ← 트리거 실패!

---

## 📁 파일 요약

| 파일 | 용도 |
|------|------|
| **`EXECUTE_THIS.sql`** | ⭐ **이거 실행하면 끝!** |
| `CHECK_RESULT.sql` | 트리거/데이터 확인 |
| `20250130_fix_user_trigger_v3_FINAL.sql` | 트리거 원본 (EXECUTE_THIS랑 동일) |

---

## 🎯 핵심 수정 내용

### Before
```sql
-- email 컬럼에 INSERT 시도
INSERT INTO user_profiles (id, email, username, ...)  -- ❌
VALUES (NEW.id, NEW.email, 'yuntaeil', ...);
-- → ERROR: column "email" does not exist
```

### After
```sql
-- email 컬럼 제거
INSERT INTO user_profiles (id, username, is_admin, ...)  -- ✅
VALUES (NEW.id, 'yuntaeil1', false, ...);
-- → SUCCESS!
```

---

## ✨ 완료!

이제 Google OAuth 로그인 시:
- ✅ `user_profiles` 자동 생성
- ✅ username 중복 방지 (윤태일 → 윤태일1)
- ✅ 20,000 RP 지급
- ✅ 빈 스쿼드 생성

**더 이상 auth에만 추가되고 user_profiles가 안 생기는 문제 없음!** 🎉
