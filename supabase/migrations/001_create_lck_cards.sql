-- LCK 선수 카드 마스터 데이터 테이블
CREATE TABLE IF NOT EXISTS lck_cards (
  id TEXT PRIMARY KEY,
  year INT NOT NULL,
  team TEXT NOT NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('TOP', 'JNG', 'MID', 'ADC', 'SUP')),
  grade TEXT NOT NULL CHECK (grade IN ('S', 'A', 'B', 'C')),
  image_url TEXT,
  ovr INT NOT NULL,
  mechanics INT NOT NULL,
  laning INT NOT NULL,
  teamfight INT NOT NULL,
  macro INT NOT NULL,
  clutch INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_lck_cards_grade ON lck_cards(grade);
CREATE INDEX IF NOT EXISTS idx_lck_cards_position ON lck_cards(position);
CREATE INDEX IF NOT EXISTS idx_lck_cards_year ON lck_cards(year);
CREATE INDEX IF NOT EXISTS idx_lck_cards_team ON lck_cards(team);

-- RLS (Row Level Security) 활성화 - 읽기 전용
ALTER TABLE lck_cards ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 (공개 데이터)
CREATE POLICY "Enable read access for all users" ON lck_cards
  FOR SELECT USING (true);

-- 샘플 데이터 삽입 (2024 T1 - 이미지 포함)
INSERT INTO lck_cards (id, year, team, name, position, grade, image_url, ovr, mechanics, laning, teamfight, macro, clutch) VALUES
('2024_T1_Faker', 2024, 'T1', 'Faker', 'MID', 'S', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop', 98, 94, 99, 99, 99, 99),
('2024_T1_Zeus', 2024, 'T1', 'Zeus', 'TOP', 'S', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=600&fit=crop', 97, 92, 99, 95, 99, 99),
('2024_T1_Oner', 2024, 'T1', 'Oner', 'JNG', 'S', 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=600&fit=crop', 92, 87, 97, 94, 96, 88),
('2024_T1_Gumayusi', 2024, 'T1', 'Gumayusi', 'ADC', 'S', '', 95, 98, 95, 95, 92, 99),
('2024_T1_Keria', 2024, 'T1', 'Keria', 'SUP', 'S', '', 95, 99, 99, 92, 97, 95),

-- 2024 Gen.G
('2024_GenG_Kiin', 2024, 'Gen.G', 'Kiin', 'TOP', 'S', '', 98, 96, 98, 93, 99, 99),
('2024_GenG_Canyon', 2024, 'Gen.G', 'Canyon', 'JNG', 'S', '', 99, 94, 99, 96, 96, 97),
('2024_GenG_Chovy', 2024, 'Gen.G', 'Chovy', 'MID', 'S', '', 98, 99, 99, 98, 99, 98),
('2024_GenG_Peyz', 2024, 'Gen.G', 'Peyz', 'ADC', 'A', '', 85, 84, 90, 92, 86, 81),
('2024_GenG_Lehends', 2024, 'Gen.G', 'Lehends', 'SUP', 'S', '', 97, 92, 99, 99, 99, 97),

-- 2024 Dplus Kia
('2024_DplusKia_Kingen', 2024, 'Dplus Kia', 'Kingen', 'TOP', 'A', '', 86, 89, 81, 85, 86, 92),
('2024_DplusKia_Lucid', 2024, 'Dplus Kia', 'Lucid', 'JNG', 'A', '', 89, 91, 95, 82, 92, 89),
('2024_DplusKia_ShowMaker', 2024, 'Dplus Kia', 'ShowMaker', 'MID', 'S', '', 94, 94, 98, 97, 90, 92),
('2024_DplusKia_Aiming', 2024, 'Dplus Kia', 'Aiming', 'ADC', 'A', '', 91, 87, 85, 91, 95, 96),
('2024_DplusKia_Kellin', 2024, 'Dplus Kia', 'Kellin', 'SUP', 'A', '', 87, 82, 80, 94, 84, 91),

-- 2024 Hanwha Life Esports
('2024_HLE_Doran', 2024, 'Hanwha Life Esports', 'Doran', 'TOP', 'A', '', 89, 83, 86, 93, 89, 88),
('2024_HLE_Peanut', 2024, 'Hanwha Life Esports', 'Peanut', 'JNG', 'S', '', 93, 89, 94, 89, 92, 92),
('2024_HLE_Zeka', 2024, 'Hanwha Life Esports', 'Zeka', 'MID', 'S', '', 96, 97, 92, 97, 98, 93),
('2024_HLE_Viper', 2024, 'Hanwha Life Esports', 'Viper', 'ADC', 'S', '', 92, 87, 91, 86, 95, 92),
('2024_HLE_Delight', 2024, 'Hanwha Life Esports', 'Delight', 'SUP', 'S', '', 94, 89, 91, 94, 93, 98),

-- 2024 KT Rolster
('2024_KT_PerfecT', 2024, 'KT Rolster', 'PerfecT', 'TOP', 'A', '', 89, 91, 84, 96, 91, 95),
('2024_KT_Pyosik', 2024, 'KT Rolster', 'Pyosik', 'JNG', 'A', '', 90, 89, 89, 97, 96, 89),
('2024_KT_Bdd', 2024, 'KT Rolster', 'Bdd', 'MID', 'S', '', 95, 99, 92, 92, 92, 95),
('2024_KT_Deft', 2024, 'KT Rolster', 'Deft', 'ADC', 'S', '', 92, 87, 89, 91, 86, 97),
('2024_KT_BeryL', 2024, 'KT Rolster', 'BeryL', 'SUP', 'B', '', 74, 69, 82, 78, 78, 76),

-- B/C 등급 추가
('2024_BNKFEARX_Clear', 2024, 'BNK FEARX', 'Clear', 'TOP', 'B', '', 74, 72, 79, 77, 68, 69),
('2024_BNKFEARX_Raptor', 2024, 'BNK FEARX', 'Raptor', 'JNG', 'B', '', 82, 89, 77, 88, 88, 77),
('2024_BNKFEARX_Clozer', 2024, 'BNK FEARX', 'Clozer', 'MID', 'A', '', 85, 91, 86, 92, 84, 79),
('2024_BNKFEARX_Hena', 2024, 'BNK FEARX', 'Hena', 'ADC', 'B', '', 78, 81, 83, 70, 84, 76),
('2024_BNKFEARX_Duro', 2024, 'BNK FEARX', 'Duro', 'SUP', 'B', '', 81, 89, 84, 74, 84, 88),
('2024_BNKFEARX_Execute', 2024, 'BNK FEARX', 'Execute', 'SUP', 'C', '', 66, 69, 60, 58, 60, 63),
('2024_DplusKia_Moham', 2024, 'Dplus Kia', 'Moham', 'SUP', 'C', '', 60, 56, 53, 53, 65, 68);

COMMENT ON TABLE lck_cards IS 'LCK 선수 카드 마스터 데이터 (2020-2025)';
