-- user_profiles 스키마 수정
-- avatar_url 컬럼 제거 (이미 없을 수 있음), email 컬럼 추가
-- 2025-01-30

-- 1. avatar_url 컬럼 제거 (존재하는 경우만)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.user_profiles DROP COLUMN avatar_url;
  END IF;
END $$;

-- 2. email 컬럼 추가 (없는 경우만)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN email TEXT;
  END IF;
END $$;

-- 3. is_admin 컬럼 확인 및 추가 (없는 경우만)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;
