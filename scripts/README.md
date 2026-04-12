# 📸 Supabase Storage 이미지 업로드 가이드

## 🎯 목표
- 1600개 선수 이미지 업로드
- 60개 팀 로고 업로드
- Supabase Storage에 저장 → CDN 자동 적용

---

## 📋 사전 준비

### 1. Supabase Dashboard 설정

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. **Storage** 메뉴 클릭
3. 2개의 Bucket 생성:

**Bucket 1: 선수 이미지**
- Name: `lck-player-images`
- Public: ✅ 체크
- **Create bucket**

**Bucket 2: 팀 로고**
- Name: `team-logos`
- Public: ✅ 체크
- **Create bucket**

### 2. 로컬 폴더 구조 준비

```
/images/
  /players/
    /2020/
      faker-mid-t1.png
      showmaker-mid-dwg.png
      ...
    /2021/
      ...
    /2022/
    /2023/
    /2024/
    /2025/
  /team-logos/
    /2020/
      t1.png
      geng.png
      dwg.png
      ...
    /2021/
    /2022/
    /2023/
    /2024/
    /2025/
```

**파일명 규칙:**
- 선수 이미지: `{name}-{position}-{team}.png` (모두 소문자)
  - 예: `faker-mid-t1.png`, `chovy-mid-geng.png`
- 팀 로고: `{team-slug}.png` (소문자)
  - 예: `t1.png`, `geng.png`, `hle.png`

### 3. 환경 변수 설정

루트에 `.env` 파일 생성 (`.env.example` 참고):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Service Role Key 찾는 법:**
1. Supabase Dashboard → **Settings** → **API**
2. **Service Role Key** 복사 (secret!)

---

## 🚀 실행 방법

### 1. 패키지 설치

```bash
npm install
```

### 2. 스크립트 실행

**모두 업로드:**
```bash
node scripts/upload-images.js
```

**선수 이미지만:**
```bash
node scripts/upload-images.js --players
```

**팀 로고만:**
```bash
node scripts/upload-images.js --logos
```

---

## 📊 업로드 결과 예시

```
🚀 Supabase Storage 업로드 시작!

📸 선수 이미지 업로드 시작...

📁 2025년: 100개 파일 업로드 중...
  ✅ faker-mid-t1.png
  ✅ zeus-top-t1.png
  ✅ oner-jgl-t1.png
  ...

📊 업로드 완료!
  ✅ 성공: 1600개
  ❌ 실패: 0개

🏆 팀 로고 업로드 시작...

📁 2025년: 10개 파일 업로드 중...
  ✅ t1.png
  ✅ geng.png
  ✅ hle.png
  ...

✨ 모든 작업 완료!
```

---

## 🔗 업로드된 이미지 URL

**선수 이미지:**
```
https://[PROJECT].supabase.co/storage/v1/object/public/lck-player-images/2025/faker-mid-t1.png
```

**팀 로고:**
```
https://[PROJECT].supabase.co/storage/v1/object/public/team-logos/2025/t1.png
```

---

## 💡 앱에서 사용하기

코드에서 자동으로 URL 생성됩니다:

```typescript
import { getPlayerImageUrl, getTeamLogoUrl } from '@/utils/imageUrls';

// 선수 이미지
const playerImg = getPlayerImageUrl(2025, "Faker", "MID", "T1");
// → https://[PROJECT].supabase.co/storage/v1/object/public/lck-player-images/2025/faker-mid-t1.png

// 팀 로고
const teamLogo = getTeamLogoUrl(2025, "t1");
// → https://[PROJECT].supabase.co/storage/v1/object/public/team-logos/2025/t1.png
```

---

## 🛠️ 문제 해결

### ❌ "Bucket not found"
→ Supabase Dashboard에서 bucket 생성 확인

### ❌ "Invalid API key"
→ `.env` 파일의 Service Role Key 확인

### ❌ "File already exists"
→ `upsert: true` 옵션으로 덮어쓰기 허용됨

---

## 📦 Supabase Storage 무료 Tier

- **저장소**: 1GB
- **전송량**: 2GB/월
- **요청**: 50MB/sec

1600개 × 50KB = 80MB 저장 → ✅ 충분!

하지만 트래픽이 많으면 Pro Plan 필요:
- $25/월: 100GB 저장 + 200GB 전송
