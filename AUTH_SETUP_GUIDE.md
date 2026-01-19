# 🔐 LCK 카드 수집 게임 - 인증 시스템 설정 가이드

## 📋 목차
1. [Supabase DB 마이그레이션](#1-supabase-db-마이그레이션)
2. [Google OAuth 설정](#2-google-oauth-설정)
3. [Kakao OAuth 설정](#3-kakao-oauth-설정)
4. [테스트](#4-테스트)

---

## 1. Supabase DB 마이그레이션

### 1-1. Supabase Dashboard 접속
1. https://supabase.com 로그인
2. 프로젝트 선택
3. 좌측 메뉴 → **SQL Editor** 클릭

### 1-2. 마이그레이션 실행
1. **New Query** 버튼 클릭
2. `/supabase/migrations/20250118_create_user_tables.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기
4. **Run** 버튼 클릭 (Ctrl/Cmd + Enter)

### 1-3. 테이블 생성 확인
좌측 메뉴 → **Table Editor**에서 다음 테이블 확인:
- ✅ `user_profiles`
- ✅ `user_game_data`
- ✅ `user_cards`
- ✅ `user_squads`

---

## 2. Google OAuth 설정

### 2-1. Google Cloud Console 설정

#### Step 1: 프로젝트 생성
1. https://console.cloud.google.com 접속
2. **프로젝트 선택** → **새 프로젝트**
3. 프로젝트 이름: `LCK Card Collection` (임의)
4. **만들기** 클릭

#### Step 2: OAuth 동의 화면 구성
1. 좌측 메뉴 → **API 및 서비스** → **OAuth 동의 화면**
2. **외부** 선택 → **만들기**
3. 필수 정보 입력:
   - 앱 이름: `LCK 선수 카드 수집`
   - 사용자 지원 이메일: 본인 이메일
   - 개발자 연락처: 본인 이메일
4. **저장 후 계속** 클릭

#### Step 3: OAuth 클라이언트 ID 생성
1. 좌측 메뉴 → **사용자 인증 정보**
2. **+ 사용자 인증 정보 만들기** → **OAuth 클라이언트 ID**
3. 애플리케이션 유형: **웹 애플리케이션**
4. 이름: `LCK Card Game Web`
5. **승인된 리디렉션 URI** 추가:
   ```
   https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback
   ```
   > ⚠️ `[YOUR-PROJECT-ID]`를 Supabase 프로젝트 ID로 교체!
6. **만들기** 클릭
7. **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사 (나중에 사용)

### 2-2. Supabase에 Google OAuth 설정

1. Supabase Dashboard → **Authentication** → **Providers**
2. **Google** 클릭 → **Enable** 토글
3. 위에서 복사한 정보 입력:
   - **Client ID**: Google 클라이언트 ID
   - **Client Secret**: Google 클라이언트 보안 비밀번호
4. **Save** 클릭

---

## 3. Kakao OAuth 설정

### 3-1. Kakao Developers 설정

#### Step 1: 애플리케이션 생성
1. https://developers.kakao.com 접속 (카카오 계정 필요)
2. **내 애플리케이션** → **애플리케이션 추가하기**
3. 앱 이름: `LCK 카드 수집` (임의)
4. 사업자명: 개인 이름
5. **저장**

#### Step 2: 플랫폼 설정
1. 생성한 앱 클릭 → 좌측 **플랫폼**
2. **Web 플랫폼 등록** 클릭
3. 사이트 도메인:
   ```
   https://[YOUR-PROJECT-ID].supabase.co
   ```
4. **저장**

#### Step 3: Redirect URI 설정
1. 좌측 **카카오 로그인** → **활성화 설정** ON
2. **Redirect URI** 등록:
   ```
   https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback
   ```
3. **저장**

#### Step 4: 동의 항목 설정
1. 좌측 **동의항목**
2. 다음 항목 **필수 동의**로 설정:
   - 닉네임
   - 프로필 이미지
   - 카카오계정(이메일)
3. **저장**

#### Step 5: REST API 키 복사
1. 좌측 **앱 설정** → **앱 키**
2. **REST API 키** 복사

### 3-2. Supabase에 Kakao OAuth 설정

1. Supabase Dashboard → **Authentication** → **Providers**
2. **Kakao** 클릭 → **Enable** 토글
3. 정보 입력:
   - **Client ID**: 위에서 복사한 REST API 키
   - **Client Secret**: (Kakao는 필요 없음 - 비워둠)
4. **Save** 클릭

---

## 4. 테스트

### 4-1. 로컬 테스트
```bash
npm run dev
```

1. 브라우저에서 http://localhost:5173 접속
2. **Google로 회원가입** 클릭 → Google 로그인 팝업 확인
3. **카카오로 회원가입** 클릭 → 카카오 로그인 팝업 확인

### 4-2. DB 확인
Supabase Dashboard → **Table Editor** → `user_profiles`:
- 로그인한 유저 정보가 저장되었는지 확인

---

## 🚨 문제 해결

### "OAuth provider not enabled"
→ Supabase Provider 설정에서 Google/Kakao Enable 확인

### "Invalid redirect URI"
→ Google/Kakao 설정에서 Redirect URI 정확히 입력했는지 확인

### "Access denied"
→ OAuth 동의 화면에서 필수 scope 설정 확인

---

## 📌 참고 문서
- [Supabase Auth 공식 문서](https://supabase.com/docs/guides/auth)
- [Google OAuth 설정](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Kakao OAuth 설정](https://supabase.com/docs/guides/auth/social-login/auth-kakao)
