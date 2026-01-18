# 🚀 LCK GACHA 배포 가이드

## 📋 배포 전 체크리스트

### ✅ 필수 확인 사항
- [x] Supabase 프로젝트 생성 완료
- [x] `lck_cards` 테이블 생성 및 데이터 입력
- [x] `team-logos` 버킷 생성 및 이미지 업로드
- [x] `lck-player-images` 버킷 생성 및 이미지 업로드
- [x] 환경 변수 확인 (`/utils/supabase/info.tsx`)

---

## 🌐 배포 옵션

### 1️⃣ **Vercel 배포 (추천 ⭐)**

#### 장점
- React/Vite 최적화
- 자동 HTTPS
- 무료 도메인 제공
- GitHub 연동 자동 배포
- 빠른 CDN

#### 배포 방법

**A. GitHub 연동 (추천)**

1. **GitHub 저장소 생성**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: LCK GACHA"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/lck-gacha.git
   git push -u origin main
   ```

2. **Vercel 배포**
   - [Vercel](https://vercel.com) 접속
   - "New Project" 클릭
   - GitHub 저장소 연결
   - 프로젝트 설정:
     - **Framework Preset**: Vite
     - **Build Command**: `pnpm build` (또는 `npm run build`)
     - **Output Directory**: `dist`
   - "Deploy" 클릭

3. **환경 변수 설정**
   - Vercel Dashboard → Settings → Environment Variables
   - 다음 변수 추가:
     ```
     VITE_SUPABASE_URL=https://qpzfzemhljgzscojkxnj.supabase.co
     VITE_SUPABASE_ANON_KEY=your_anon_key_here
     ```

**B. Vercel CLI**

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

---

### 2️⃣ **Netlify 배포**

#### 배포 방법

1. **Netlify 접속**
   - [Netlify](https://netlify.com) 접속
   - "Add new site" → "Import an existing project"

2. **GitHub 연동**
   - GitHub 저장소 선택
   - 빌드 설정:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`

3. **환경 변수 설정**
   - Site settings → Environment variables
   - 환경 변수 추가 (Vercel과 동일)

---

### 3️⃣ **Cloudflare Pages**

#### 배포 방법

1. **Cloudflare Pages 접속**
   - [Cloudflare Pages](https://pages.cloudflare.com)
   - "Create a project" 클릭

2. **GitHub 연동**
   - 저장소 선택
   - 빌드 설정:
     - **Build command**: `npm run build`
     - **Build output directory**: `dist`

3. **환경 변수 설정**
   - Settings → Environment variables

---

## 🔧 로컬 빌드 테스트

```bash
# 의존성 설치
npm install

# 빌드
npm run build

# 빌드 결과물 미리보기
npx vite preview
```

빌드 결과물은 `/dist` 폴더에 생성됩니다.

---

## 🌍 커스텀 도메인 연결

### Vercel
1. Vercel Dashboard → Settings → Domains
2. "Add Domain" 클릭
3. 도메인 입력 (예: `lck-gacha.com`)
4. DNS 설정 (도메인 등록업체에서):
   ```
   Type: CNAME
   Name: www (또는 @)
   Value: cname.vercel-dns.com
   ```

### Netlify
1. Site settings → Domain management
2. "Add custom domain"
3. DNS 설정

---

## ⚙️ 환경 변수 상세

### `/utils/supabase/info.tsx`

현재 하드코딩된 환경 변수를 안전하게 관리하려면:

**옵션 1: Vite 환경 변수 사용**

1. `.env` 파일 생성 (프로젝트 루트):
   ```env
   VITE_SUPABASE_URL=https://qpzfzemhljgzscojkxnj.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

2. `/utils/supabase/info.tsx` 수정:
   ```typescript
   export const projectId = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] || "qpzfzemhljgzscojkxnj";
   export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "your_fallback_key";
   ```

3. `.gitignore`에 추가:
   ```
   .env
   .env.local
   ```

**옵션 2: 현재 상태 유지 (간단함)**
- 현재처럼 하드코딩된 상태로 배포 (PUBLIC ANON KEY는 노출되어도 안전)

---

## 🔒 보안 체크리스트

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] `SUPABASE_SERVICE_ROLE_KEY`는 서버에만 존재 (프론트엔드 노출 금지)
- [ ] Supabase Row Level Security (RLS) 설정 확인
- [ ] 버킷 권한 설정 (Public/Private 확인)

---

## 📊 배포 후 확인사항

### ✅ 기능 테스트
- [ ] 카드 데이터 로딩 확인
- [ ] 가챠 뽑기 작동
- [ ] 스쿼드 편집 작동
- [ ] 컬렉션 확인
- [ ] 이미지 로딩 (선수 이미지, 팀 로고)
- [ ] 시너지 계산
- [ ] LocalStorage 저장

### ✅ 성능 확인
- [ ] 초기 로딩 속도
- [ ] 이미지 로딩 속도
- [ ] 모바일 반응형 확인

---

## 🆘 문제 해결

### 문제: 카드 데이터가 안 불러와져요
- Supabase URL과 API 키 확인
- 브라우저 콘솔에서 네트워크 에러 확인
- Supabase Dashboard에서 테이블 권한 확인

### 문제: 이미지가 안 보여요
- Supabase Storage 버킷이 Public인지 확인
- 이미지 파일명이 코드와 일치하는지 확인
- 브라우저 개발자 도구 Network 탭에서 404 에러 확인

### 문제: 빌드가 실패해요
- `npm install` 다시 실행
- Node.js 버전 확인 (v18+ 권장)
- 에러 메시지 확인

---

## 📞 문의

배포 관련 문의: actorcloset123@gmail.com

---

## 🎉 배포 완료!

축하합니다! LCK GACHA가 전 세계에 공개되었습니다! 🚀

**공유하기:**
- Twitter/X에 공유
- LCK 커뮤니티에 홍보
- Reddit r/leagueoflegends 게시

**다음 단계:**
- Google Analytics 연동
- SEO 최적화
- 피드백 수집
- 버그 수정 및 기능 추가
