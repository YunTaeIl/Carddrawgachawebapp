# 리그 시스템 DB 설계 문서

## 📋 개요

Legends Manager의 리그 진행 상태를 Supabase DB에 저장하여, 사용자가 언제든지 중단했던 지점부터 다시 시작할 수 있도록 구현.

---

## 🗄️ 1. 이상적인 SQL 스키마 (참고용)

### 1.1 리그 메인 테이블

```sql
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  league_type TEXT NOT NULL CHECK (league_type IN ('legend', 'tier1', 'tier2', 'tier3')),
  player_team_id TEXT NOT NULL,
  season_state TEXT NOT NULL CHECK (season_state IN ('regular', 'playoffs', 'finished')),
  current_round INTEGER NOT NULL DEFAULT 1,
  current_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_active_league UNIQUE (user_id)
);

CREATE INDEX idx_leagues_user ON leagues(user_id);
```

### 1.2 리그 팀 정보

```sql
CREATE TABLE league_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL,
  team_name TEXT NOT NULL,
  team_tag TEXT NOT NULL,
  tendency TEXT NOT NULL CHECK (tendency IN ('aggressive', 'balanced', 'defensive')),
  is_player_team BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- 스쿼드 (카드 ID)
  top_card_id TEXT,
  jgl_card_id TEXT,
  mid_card_id TEXT,
  adc_card_id TEXT,
  sup_card_id TEXT,
  
  CONSTRAINT unique_team_per_league UNIQUE (league_id, team_id)
);

CREATE INDEX idx_teams_league ON league_teams(league_id);
```

### 1.3 선수 폼 상태

```sql
CREATE TABLE league_player_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_team_id UUID NOT NULL REFERENCES league_teams(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  form_modifier NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  
  CONSTRAINT unique_form_per_player UNIQUE (league_team_id, card_id)
);
```

### 1.4 정규시즌 매치 스케줄 & 결과

```sql
CREATE TABLE league_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  match_index INTEGER NOT NULL,
  home_team_id TEXT NOT NULL,
  away_team_id TEXT NOT NULL,
  
  -- 결과 (미진행 시 NULL)
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  home_score INTEGER,
  away_score INTEGER,
  winner_id TEXT,
  
  CONSTRAINT unique_match_per_round UNIQUE (league_id, round, match_index)
);

CREATE INDEX idx_matches_league ON league_matches(league_id);
CREATE INDEX idx_matches_round ON league_matches(league_id, round);
```

### 1.5 순위표

```sql
CREATE TABLE league_standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  game_wins INTEGER NOT NULL DEFAULT 0,
  game_losses INTEGER NOT NULL DEFAULT 0,
  score_diff INTEGER NOT NULL DEFAULT 0,
  
  CONSTRAINT unique_standing_per_team UNIQUE (league_id, team_id)
);

CREATE INDEX idx_standings_league ON league_standings(league_id);
```

### 1.6 플레이오프 브래킷

```sql
CREATE TABLE league_playoff_brackets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  round_name TEXT NOT NULL CHECK (round_name IN ('wildcard', 'semifinals', 'playoffs', 'finals')),
  match_index INTEGER NOT NULL DEFAULT 0,
  
  -- 팀 정보
  team1_id TEXT,
  team1_seed INTEGER,
  team2_id TEXT,
  team2_seed INTEGER,
  
  -- 결과
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  winner_id TEXT,
  team1_wins INTEGER DEFAULT 0,
  team2_wins INTEGER DEFAULT 0,
  
  CONSTRAINT unique_playoff_match UNIQUE (league_id, round_name, match_index)
);

CREATE INDEX idx_playoffs_league ON league_playoff_brackets(league_id);
```

---

## 🔑 2. 실제 구현 (KV Store)

Figma Make 환경에서는 **새 테이블 생성이 불가능**하므로, **Supabase KV Store**를 활용하여 JSON 형태로 저장.

### 2.1 키 구조

```typescript
// 사용자당 하나의 활성 리그만 허용
키: `league:${userId}:current`
```

### 2.2 저장 데이터 (LeagueInstance)

```typescript
interface LeagueInstance {
  id: string;                    // "league_1706112345678"
  leagueType: LeagueType;        // "tier1" | "tier2" | "tier3" | "legend"
  seasonState: SeasonState;      // "regular" | "playoffs" | "finished"
  currentPoints: number;         // 획득 포인트
  
  // 팀 정보 (10팀)
  teams: Team[];                 // 플레이어 팀 + AI 팀 9개
  playerTeamId: string;
  
  // 정규시즌 (18라운드 × 5경기 = 90경기)
  matches: Match[];
  standings: StandingEntry[];
  
  // 플레이오프 (있으면)
  playoffBracket?: PlayoffBracket;
  championTeamId?: string;
  playoffResult?: "champion" | "runner-up" | "playoffs" | "semifinals" | "wildcard" | "eliminated";
  
  // 메타데이터
  createdAt: string;
  updatedAt: string;
}
```

### 2.3 예시 데이터

```json
{
  "id": "league_1706112345678",
  "leagueType": "tier1",
  "seasonState": "regular",
  "currentPoints": 4000,
  "teams": [
    {
      "id": "team_player",
      "name": "내 팀",
      "isPlayer": true,
      "squad": {
        "TOP": { "id": "card_001", ... },
        "JGL": { "id": "card_002", ... },
        "MID": { "id": "card_003", ... },
        "ADC": { "id": "card_004", ... },
        "SUP": { "id": "card_005", ... }
      },
      "stats": { ... }
    },
    { ... 9개 AI 팀 ... }
  ],
  "playerTeamId": "team_player",
  "matches": [
    {
      "id": "match_r1_0",
      "round": 1,
      "homeTeamId": "team_player",
      "awayTeamId": "team_ai_1",
      "isCompleted": true,
      "result": {
        "homeScore": 2,
        "awayScore": 1,
        "winnerId": "team_player",
        ...
      }
    },
    ... // 총 90경기
  ],
  "standings": [
    {
      "teamId": "team_player",
      "teamName": "내 팀",
      "wins": 2,
      "losses": 0,
      "scoreDiff": 3,
      "isPlayer": true
    },
    ... // 총 10팀
  ],
  "createdAt": "2026-01-24T10:00:00Z",
  "updatedAt": "2026-01-24T12:30:00Z"
}
```

---

## 🔌 3. API 엔드포인트

### 3.1 리그 저장

**요청:**
```http
POST /make-server-ffd115c0/league/save
Authorization: Bearer {publicAnonKey}
Content-Type: application/json

{
  "userId": "google_12345",
  "league": { ... LeagueInstance ... }
}
```

**응답:**
```json
{
  "success": true,
  "message": "리그 데이터 저장 완료"
}
```

---

### 3.2 리그 로드

**요청:**
```http
GET /make-server-ffd115c0/league/load?userId=google_12345
Authorization: Bearer {publicAnonKey}
```

**응답:**
```json
{
  "success": true,
  "league": { ... LeagueInstance ... }
}
```

**404 (저장된 리그 없음):**
```json
{
  "error": "저장된 리그가 없습니다"
}
```

---

### 3.3 리그 삭제

**요청:**
```http
DELETE /make-server-ffd115c0/league/delete
Authorization: Bearer {publicAnonKey}
Content-Type: application/json

{
  "userId": "google_12345"
}
```

**응답:**
```json
{
  "success": true,
  "message": "리그 데이터 삭제 완료"
}
```

---

## 💾 4. 저장/로드 플로우

### 4.1 초기 로드 (앱 시작 시)

```
1. LeagueProvider 마운트
   ↓
2. DB에서 리그 로드 시도
   - 성공 → setCurrentLeague(dbLeague)
   - 실패 → localStorage 확인 (마이그레이션)
   ↓
3. localStorage에 있으면
   - setCurrentLeague(localLeague)
   - DB에 저장 (마이그레이션)
```

### 4.2 자동 저장 (상태 변경 시)

```
경기 완료 / 라운드 진행 / 플레이오프 진출 등
   ↓
setCurrentLeague(updatedLeague)
   ↓
useEffect 트리거
   ↓
비동기로 DB & localStorage 동시 저장
```

### 4.3 리그 포기 시

```
사용자가 "리그 포기" 클릭
   ↓
deleteLeague() 호출
   ↓
1. DB에서 삭제
2. localStorage 삭제
3. setCurrentLeague(null)
```

---

## 📊 5. 데이터 크기 추정

### 5.1 평균 리그 데이터 크기

```
- 팀 10개 (각 선수 5명 × 카드 데이터) ≈ 50KB
- 매치 90경기 (스케줄 + 결과) ≈ 100KB
- 순위표 10개 ≈ 1KB
- 플레이오프 브래킷 ≈ 5KB
- 메타데이터 ≈ 1KB

총 합계: 약 150~200KB (JSON)
```

### 5.2 KV Store 제약

Supabase KV Store는 일반적으로 **값당 수 MB**까지 지원하므로, 리그 데이터는 충분히 저장 가능.

---

## 🔄 6. 마이그레이션 전략

### 6.1 기존 localStorage → DB

```typescript
// LeagueContext.tsx의 초기 로드에서 자동 처리

useEffect(() => {
  const loadLeague = async () => {
    // 1. DB 우선 확인
    const dbLeague = await loadLeagueFromDb(userId);
    
    if (dbLeague) {
      setCurrentLeague(dbLeague);
    } else {
      // 2. localStorage 확인
      const localLeague = localStorage.getItem(STORAGE_KEY);
      if (localLeague) {
        const league = JSON.parse(localLeague);
        setCurrentLeague(league);
        
        // 3. DB에 마이그레이션
        await saveLeagueToDb(userId, league);
      }
    }
  };
  
  loadLeague();
}, [userId]);
```

### 6.2 Fallback 메커니즘

```
DB 저장 실패 시
   ↓
최소한 localStorage에는 저장 (기존 방식)
   ↓
다음 번 상태 변경 시 다시 DB 저장 시도
```

---

## 🚀 7. 구현 완료 체크리스트

### 백엔드 (Supabase Edge Function)

- [x] `/supabase/functions/server/league_api.tsx` 생성
  - [x] `POST /league/save` - 리그 저장
  - [x] `GET /league/load` - 리그 로드
  - [x] `DELETE /league/delete` - 리그 삭제
- [x] `/supabase/functions/server/index.tsx` 라우트 연결

### 프론트엔드

- [x] `/src/utils/leagueStorage.ts` 유틸리티 함수
  - [x] `saveLeagueToDb()`
  - [x] `loadLeagueFromDb()`
  - [x] `deleteLeagueFromDb()`
- [x] `/src/contexts/LeagueContext.tsx` 수정
  - [x] 초기 로드 시 DB 우선, localStorage fallback
  - [x] 상태 변경 시 DB & localStorage 동시 저장
  - [x] `deleteLeague()` DB 연동

---

## 🎯 8. 사용 예시

### 8.1 새 리그 시작

```typescript
// 사용자가 "1부 리그" 선택
startNewLeague("tier1");

// ↓ 자동 저장
// - DB: league:google_12345:current
// - localStorage: lck_league_instance
```

### 8.2 경기 진행

```typescript
// 경기 결과 기록
completeMatch(matchResult);

// ↓ setCurrentLeague 트리거
// ↓ useEffect로 자동 저장
// - DB: 업데이트
// - localStorage: 업데이트
```

### 8.3 앱 재시작

```typescript
// 사용자가 앱 종료 후 재접속
// ↓ LeagueProvider 마운트
// ↓ useEffect 트리거
// ↓ loadLeagueFromDb(userId)
// ↓ setCurrentLeague(dbLeague)
// ✅ 이전 진행 상황부터 계속!
```

### 8.4 리그 포기

```typescript
// 사용자가 "리그 포기" 클릭
deleteLeague();

// ↓ DB 삭제
// ↓ localStorage 삭제
// ↓ setCurrentLeague(null)
// ✅ 리그 선택 페이지로 이동
```

---

## 📝 9. 주의사항

### 9.1 동시성

- 현재 구현은 **사용자당 하나의 활성 리그**만 지원
- 동일 계정으로 여러 디바이스에서 접속 시, 마지막 저장이 덮어씀
- 향후 개선: 버전 관리 또는 충돌 감지

### 9.2 네트워크 오류

- DB 저장 실패 시 localStorage fallback
- 로드 실패 시 localStorage 사용
- 오프라인 모드에서도 기본 플레이 가능

### 9.3 데이터 무결성

- 리그 중간 상태 저장 시 `updatedAt` 타임스탬프 업데이트
- 손상된 JSON 데이터 발견 시 로그 출력 및 초기화

---

## 🔮 10. 향후 확장 가능성

### 10.1 다중 리그 지원

```
키 구조 변경:
  league:${userId}:current        → 현재 활성 리그
  league:${userId}:history:${id}  → 과거 시즌 기록
```

### 10.2 클라우드 세이브

```
- 디바이스 간 동기화
- 시즌 히스토리 보관
- 통계 대시보드
```

### 10.3 리플레이 시스템

```
- 경기 이벤트 로그 저장
- 타임라인 재생
- 하이라이트 클립
```

---

## ✅ 완료!

리그 시스템이 Supabase DB와 완전히 연동되어, 사용자가 **언제든지 중단했던 지점부터 리그를 이어서 진행**할 수 있습니다! 🎮🏆
