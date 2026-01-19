-- LCK 카드 수집 게임 유저 테이블 생성
-- 2025-01-18

-- 1. 유저 프로필 테이블
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 유저 게임 데이터 테이블 (재화, 가챠 상태)
CREATE TABLE IF NOT EXISTS public.user_game_data (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  currency INTEGER NOT NULL DEFAULT 10000,
  shards INTEGER NOT NULL DEFAULT 0,
  s_pity_stack INTEGER NOT NULL DEFAULT 0,
  a_pity_stack INTEGER NOT NULL DEFAULT 0,
  total_pulls INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 유저 보유 카드 테이블 (개별 카드 인스턴스)
CREATE TABLE IF NOT EXISTS public.user_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL, -- lck_cards의 id 참조
  instance_id TEXT NOT NULL UNIQUE, -- 카드 개별 식별자
  upgrade_level INTEGER NOT NULL DEFAULT 0 CHECK (upgrade_level >= 0 AND upgrade_level <= 3),
  obtained_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 유저 스쿼드 배치 테이블
CREATE TABLE IF NOT EXISTS public.user_squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position TEXT NOT NULL CHECK (position IN ('TOP', 'JGL', 'MID', 'ADC', 'SUP')),
  card_instance_id UUID REFERENCES public.user_cards(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, position)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_user_cards_user_id ON public.user_cards(user_id);
CREATE INDEX idx_user_cards_instance_id ON public.user_cards(instance_id);
CREATE INDEX idx_user_cards_card_id ON public.user_cards(card_id);
CREATE INDEX idx_user_squads_user_id ON public.user_squads(user_id);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_game_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_squads ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 본인 데이터만 조회/수정 가능
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own game data"
  ON public.user_game_data FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own game data"
  ON public.user_game_data FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own game data"
  ON public.user_game_data FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own cards"
  ON public.user_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards"
  ON public.user_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards"
  ON public.user_cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards"
  ON public.user_cards FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own squad"
  ON public.user_squads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own squad"
  ON public.user_squads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own squad"
  ON public.user_squads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own squad"
  ON public.user_squads FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_game_data_updated_at
  BEFORE UPDATE ON public.user_game_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_squads_updated_at
  BEFORE UPDATE ON public.user_squads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
