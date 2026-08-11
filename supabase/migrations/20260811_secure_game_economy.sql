-- 게임 재화 보안 강화
-- 1) 브라우저의 user_game_data 직접 INSERT/UPDATE를 차단한다.
-- 2) 일반 진행 저장은 잔액을 늘릴 수 없는 RPC로 제한한다.
-- 3) 출석 보상은 KST 날짜 기준의 원자적/멱등 RPC로만 지급한다.

ALTER TABLE public.user_game_data
  ADD COLUMN IF NOT EXISTS last_check_in TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pity_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS pack_statistics JSONB NOT NULL DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS total_shards_spent INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_league_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.user_game_data
  DROP CONSTRAINT IF EXISTS user_game_data_currency_nonnegative,
  DROP CONSTRAINT IF EXISTS user_game_data_shards_nonnegative;

ALTER TABLE public.user_game_data
  ADD CONSTRAINT user_game_data_currency_nonnegative CHECK (currency >= 0),
  ADD CONSTRAINT user_game_data_shards_nonnegative CHECK (shards >= 0);

CREATE TABLE IF NOT EXISTS public.economy_request_log (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation TEXT NOT NULL,
  request_key TEXT NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, operation, request_key),
  CONSTRAINT economy_request_key_length CHECK (char_length(request_key) BETWEEN 1 AND 128)
);

ALTER TABLE public.economy_request_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.economy_request_log FROM anon, authenticated;

-- 기존 "본인 row면 자유롭게 수정" 정책과 권한을 제거한다.
DROP POLICY IF EXISTS "Users can update own game data" ON public.user_game_data;
DROP POLICY IF EXISTS "Users can insert own game data" ON public.user_game_data;
REVOKE INSERT, UPDATE, DELETE ON public.user_game_data FROM anon, authenticated;

-- 로그인 사용자는 자신의 게임 데이터를 읽을 수만 있다.
GRANT SELECT ON public.user_game_data TO authenticated;

CREATE OR REPLACE FUNCTION public.save_game_progress(
  p_request_key TEXT,
  p_currency INTEGER,
  p_shards INTEGER,
  p_pity_data JSONB,
  p_pack_statistics JSONB,
  p_total_shards_spent INTEGER,
  p_total_league_count INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_current public.user_game_data%ROWTYPE;
  v_response JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '28000';
  END IF;

  IF p_request_key IS NULL OR char_length(p_request_key) NOT BETWEEN 1 AND 128 THEN
    RAISE EXCEPTION 'invalid request key' USING ERRCODE = '22023';
  END IF;

  SELECT response
    INTO v_response
    FROM public.economy_request_log
   WHERE user_id = v_user_id
     AND operation = 'save_game_progress'
     AND request_key = p_request_key;

  IF FOUND THEN
    RETURN v_response;
  END IF;

  SELECT *
    INTO v_current
    FROM public.user_game_data
   WHERE id = v_user_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'game data not found' USING ERRCODE = 'P0002';
  END IF;

  IF p_currency < 0 OR p_shards < 0 THEN
    RAISE EXCEPTION 'resource balance cannot be negative' USING ERRCODE = '22023';
  END IF;

  -- 일반 진행 저장은 재화를 차감하거나 그대로 둘 수만 있다.
  -- 재화 증가는 출석/가챠/리그 등 별도의 서버 권한 함수에서만 처리한다.
  IF p_currency > v_current.currency OR p_shards > v_current.shards THEN
    RAISE EXCEPTION 'client cannot increase game resources' USING ERRCODE = '42501';
  END IF;

  UPDATE public.user_game_data
     SET currency = p_currency,
         shards = p_shards,
         pity_data = COALESCE(p_pity_data, '{}'::JSONB),
         pack_statistics = COALESCE(p_pack_statistics, '{}'::JSONB),
         total_shards_spent = GREATEST(total_shards_spent, COALESCE(p_total_shards_spent, 0)),
         total_league_count = GREATEST(total_league_count, COALESCE(p_total_league_count, 0)),
         updated_at = NOW()
   WHERE id = v_user_id
   RETURNING jsonb_build_object(
     'success', TRUE,
     'currency', currency,
     'shards', shards,
     'updatedAt', updated_at
   ) INTO v_response;

  INSERT INTO public.economy_request_log (user_id, operation, request_key, response)
  VALUES (v_user_id, 'save_game_progress', p_request_key, v_response)
  ON CONFLICT (user_id, operation, request_key) DO NOTHING;

  SELECT response
    INTO v_response
    FROM public.economy_request_log
   WHERE user_id = v_user_id
     AND operation = 'save_game_progress'
     AND request_key = p_request_key;

  RETURN v_response;
END;
$$;

REVOKE ALL ON FUNCTION public.save_game_progress(TEXT, INTEGER, INTEGER, JSONB, JSONB, INTEGER, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_game_progress(TEXT, INTEGER, INTEGER, JSONB, JSONB, INTEGER, INTEGER) TO authenticated;

-- Edge Function 전용 출석 처리. 호출 전에 Edge Function이 JWT의 user id를 검증한다.
CREATE OR REPLACE FUNCTION public.claim_daily_attendance_for_user(
  p_user_id UUID,
  p_request_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_currency INTEGER;
  v_last_check_in TIMESTAMPTZ;
  v_response JSONB;
  v_next_check_in TIMESTAMPTZ;
BEGIN
  IF p_request_key IS NULL OR char_length(p_request_key) NOT BETWEEN 1 AND 128 THEN
    RAISE EXCEPTION 'invalid request key' USING ERRCODE = '22023';
  END IF;

  SELECT response
    INTO v_response
    FROM public.economy_request_log
   WHERE user_id = p_user_id
     AND operation = 'daily_attendance'
     AND request_key = p_request_key;

  IF FOUND THEN
    RETURN v_response;
  END IF;

  v_next_check_in := ((timezone('Asia/Seoul', NOW())::date + 1)::timestamp AT TIME ZONE 'Asia/Seoul');

  UPDATE public.user_game_data
     SET currency = currency + 5000,
         last_check_in = NOW(),
         updated_at = NOW()
   WHERE id = p_user_id
     AND (
       last_check_in IS NULL
       OR timezone('Asia/Seoul', last_check_in)::date < timezone('Asia/Seoul', NOW())::date
     )
   RETURNING currency, last_check_in
        INTO v_currency, v_last_check_in;

  IF FOUND THEN
    v_response := jsonb_build_object(
      'success', TRUE,
      'reward', 5000,
      'newCurrency', v_currency,
      'lastCheckIn', v_last_check_in,
      'nextCheckIn', v_next_check_in,
      'message', '출석 완료! 5,000 RP를 받았습니다.'
    );
  ELSE
    SELECT currency, last_check_in
      INTO v_currency, v_last_check_in
      FROM public.user_game_data
     WHERE id = p_user_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'game data not found' USING ERRCODE = 'P0002';
    END IF;

    v_response := jsonb_build_object(
      'success', FALSE,
      'reward', 0,
      'newCurrency', v_currency,
      'lastCheckIn', v_last_check_in,
      'nextCheckIn', v_next_check_in,
      'message', '이미 오늘 출석했습니다.'
    );
  END IF;

  INSERT INTO public.economy_request_log (user_id, operation, request_key, response)
  VALUES (p_user_id, 'daily_attendance', p_request_key, v_response)
  ON CONFLICT (user_id, operation, request_key) DO NOTHING;

  -- 같은 request key가 동시에 들어온 경우 최초 응답을 그대로 돌려준다.
  SELECT response
    INTO v_response
    FROM public.economy_request_log
   WHERE user_id = p_user_id
     AND operation = 'daily_attendance'
     AND request_key = p_request_key;

  RETURN v_response;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_daily_attendance_for_user(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_daily_attendance_for_user(UUID, TEXT) TO service_role;

COMMENT ON FUNCTION public.save_game_progress(TEXT, INTEGER, INTEGER, JSONB, JSONB, INTEGER, INTEGER)
  IS '인증 사용자의 진행 저장. 현재 DB 잔액보다 재화를 늘리는 요청은 거부한다.';

COMMENT ON FUNCTION public.claim_daily_attendance_for_user(UUID, TEXT)
  IS 'Edge Function 전용 원자적 일일 출석 보상. KST 날짜와 request key로 중복 지급을 방지한다.';
