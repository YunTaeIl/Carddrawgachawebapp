# 🎯 이미지 자동 매칭 가이드

## 문제

- **DB 팀명**: "Gen.G", "Hanwha Life Esports"
- **Storage 파일명**: "GENG", "GEN", "HLE"
- **결과**: 매칭 안 됨! 😱

---

## 해결책

자동 매칭 스크립트가 다음을 수행합니다:

1. ✅ DB에서 모든 카드 조회
2. ✅ 각 카드마다 가능한 모든 팀명 변형 시도
3. ✅ 시즌 우선순위대로 이미지 검색 (WC → Summer → Spring ...)
4. ✅ 찾은 이미지 URL을 자동으로 DB UPDATE

---

## 실행 방법

### 1. 환경 변수 설정

`.env` 파일:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. 스크립트 실행

```bash
node scripts/match-images.js
```

---

## 작동 방식

### 예시: Chovy 선수

**DB 데이터:**
```
id: "2025_chovy"
year: 2025
team: "Gen.G"
name: "Chovy"
image: null
```

**스크립트 시도 순서:**
```
1. 2025_GENG_Chovy_WC.png          ✅ 찾음!
2. 2025_GEN_Chovy_WC.png           (시도 안 함, 이미 찾음)
3. 2025_Gen_G_Chovy_WC.png         (시도 안 함)
...
```

**결과:**
```
UPDATE lck_cards 
SET image = 'https://[PROJECT].supabase.co/storage/v1/object/public/lck-player-images/2025_GENG_Chovy_WC.png'
WHERE id = '2025_chovy'
```

---

## 팀명 매핑

스크립트는 다음 변형들을 자동으로 시도합니다:

| DB 팀명 | Storage 변형들 |
|---------|----------------|
| Gen.G | GENG, GEN, Gen_G, GenG |
| Hanwha Life Esports | HLE, Hanwha_Life_Esports |
| Dplus KIA | Dplus_KIA, DK, DplusKIA, DPLUS |
| KT Rolster | KT_Rolster, KT |
| DWG KIA | DWG_KIA, DWG, DWGKIA |
| CJ Entus Frost | CJ_Entus_Frost |
| ... | ... |

---

## 시즌 우선순위

각 팀명 변형마다 다음 순서로 시도:

1. **WC** (월드챔피언십)
2. **Summer**
3. **Spring**
4. **Split3**
5. **Split2**
6. **Split1**
7. **시즌 없음** (예: 2025_T1_Faker.png)

---

## 결과 예시

```
🚀 이미지 자동 매칭 시작!

📥 DB에서 카드 조회 중...
✅ 346개 카드 조회 완료!

[1/346] 2025_t1_faker
  🔍 Faker (T1, 2025)
     팀 변형: T1
     ✅ 찾음! 2025_T1_Faker_WC.png

[2/346] 2025_geng_chovy
  🔍 Chovy (Gen.G, 2025)
     팀 변형: GENG, GEN, Gen_G, GenG
     ✅ 찾음! 2025_GENG_Chovy_WC.png

[3/346] 2013_madlife
  🔍 Madlife (CJ Entus Frost, 2013)
     팀 변형: CJ_Entus_Frost
     ✅ 찾음! 2013_CJ_Entus_Frost_Madlife_Spring.png

...

💾 10개 카드 업데이트 중...
✅ 업데이트 완료! (총 10개)

==================================================
📊 매칭 결과 요약
==================================================
총 카드 수:        346개
이미 이미지 있음:  0개
✅ 이미지 찾음:    312개
❌ 이미지 없음:    34개
💾 DB 업데이트:    312개
==================================================

✨ 완료!
```

---

## 옵션 설정

### 이미 이미지가 있는 카드도 다시 매칭하려면:

스크립트의 67-72번 줄 주석 처리:
```javascript
// if (card.image) {
//   console.log(`  ⏭️  이미 이미지 있음: ${card.image}`);
//   alreadyHasImage++;
//   continue;
// }
```

### 팀명 변형 추가하려면:

스크립트의 `TEAM_MAPPING` 객체에 추가:
```javascript
const TEAM_MAPPING = {
  // ...
  "새로운 팀명": ["변형1", "변형2", "변형3"],
};
```

---

## 문제 해결

### ❌ "Failed to fetch" 에러

→ `.env` 파일의 SUPABASE_URL 확인

### ❌ "Unauthorized" 에러

→ SERVICE_ROLE_KEY 확인 (Anon Key가 아님!)

### ❌ 이미지를 못 찾음

→ Storage 파일명 확인 후 TEAM_MAPPING에 변형 추가

---

## 수동 매칭이 필요한 경우

스크립트가 못 찾은 34개 카드는 수동으로:

```sql
UPDATE lck_cards 
SET image = 'https://[PROJECT].supabase.co/storage/v1/object/public/lck-player-images/정확한파일명.png'
WHERE id = '카드ID';
```

또는 Supabase Dashboard → Table Editor에서 직접 편집
