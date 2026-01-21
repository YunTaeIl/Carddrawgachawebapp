-- user_squads 테이블 스키마 수정
-- position별 row 방식을 5개 컬럼 방식으로 변경
-- 2025-01-22

-- 기존 테이블 삭제 후 재생성
DROP TABLE IF EXISTS public.user_squads CASCADE;

-- user_squads 테이블 재생성 (5개 포지션을 컬럼으로 저장)
CREATE TABLE IF NOT EXISTS public.user_squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  top_card_instance_id TEXT,
  jgl_card_instance_id TEXT,
  mid_card_instance_id TEXT,
  adc_card_instance_id TEXT,
  sup_card_instance_id TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_user_squads_user_id ON public.user_squads(user_id);

-- RLS 정책
ALTER TABLE public.user_squads ENABLE ROW LEVEL SECURITY;

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

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_user_squads_updated_at
  BEFORE UPDATE ON public.user_squads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
