// Supabase Storage 이미지와 DB 카드 자동 매칭 스크립트
// 
// 기능:
// 1. DB에서 모든 카드 조회
// 2. 각 카드에 대해 Storage에서 이미지 찾기 (팀명 변형 + 시즌 우선순위)
// 3. 찾은 이미지 URL로 DB 업데이트

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

// 팀명 매핑 (DB → Storage 파일명)
const TEAM_MAPPING = {
  "T1": ["T1"],
  "Gen.G": ["GENG", "GEN", "Gen_G", "GenG"],
  "Hanwha Life Esports": ["HLE", "Hanwha_Life_Esports"],
  "Dplus KIA": ["Dplus_KIA", "DK", "DplusKIA", "DPLUS"],
  "Dplus Kia": ["Dplus_KIA", "DK", "DplusKIA", "DPLUS"],
  "KT Rolster": ["KT_Rolster", "KT"],
  "DRX": ["DRX"],
  "Nongshim RedForce": ["Nongshim_RedForce", "NS", "NongShim"],
  "Kwangdong Freecs": ["Kwangdong_Freecs", "KDF"],
  "DWG KIA": ["DWG_KIA", "DWG", "DWGKIA"],
  "SANDBOX": ["SANDBOX", "SB"],
  "Liiv SANDBOX": ["Liiv_SANDBOX", "LSB"],
  "Fredit BRION": ["Fredit_BRION", "BRO", "BRION"],
  "OKSavingsBank BRION": ["OKSavingsBank_BRION", "BRO", "BRION"],
  "BNK FEARX": ["BNK_FEARX", "BNK"],
  "Afreeca Freecs": ["Afreeca_Freecs", "AFS", "AF"],
  "EDward Gaming": ["EDward_Gaming", "EDG"],
  "JD Gaming": ["JD_Gaming", "JDG"],
  "CJ Entus": ["CJ_Entus"],
  "CJ Entus Frost": ["CJ_Entus_Frost"],
  "MVP Blue": ["MVP_Blue"],
  "Chunnam Techno University": ["Chunnam_Techno_University"]
};

// 시즌 우선순위
const SEASONS = ['WC', 'Summer', 'Spring', 'Split3', 'Split2', 'Split1'];

/**
 * 이미지 URL이 실제로 존재하는지 확인
 */
async function checkImageExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * 카드에 맞는 이미지 URL 찾기
 */
async function findImageForCard(card) {
  const { year, team, name } = card;
  
  // 팀명 변형들
  const teamVariants = TEAM_MAPPING[team] || [team.replace(/\s+/g, '_').replace(/\./g, '_')];
  
  console.log(`  🔍 ${name} (${team}, ${year})`);
  console.log(`     팀 변형: ${teamVariants.join(', ')}`);
  
  // 모든 조합 시도
  for (const season of SEASONS) {
    for (const teamVariant of teamVariants) {
      // 패턴: {year}_{team}_{name}_{season}.png
      const filename = `${year}_${teamVariant}_${name}_${season}.png`;
      const url = `${supabaseUrl}/storage/v1/object/public/lck-player-images/${filename}`;
      
      const exists = await checkImageExists(url);
      if (exists) {
        console.log(`     ✅ 찾음! ${filename}`);
        return url;
      }
    }
  }
  
  // 시즌 없는 버전도 시도
  for (const teamVariant of teamVariants) {
    const filename = `${year}_${teamVariant}_${name}.png`;
    const url = `${supabaseUrl}/storage/v1/object/public/lck-player-images/${filename}`;
    
    const exists = await checkImageExists(url);
    if (exists) {
      console.log(`     ✅ 찾음! ${filename} (시즌 없음)`);
      return url;
    }
  }
  
  console.log(`     ❌ 이미지 없음`);
  return null;
}

/**
 * 메인 실행
 */
async function main() {
  console.log('🚀 이미지 자동 매칭 시작!\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}\n`);
  
  // 1. DB에서 모든 카드 조회
  console.log('📥 DB에서 카드 조회 중...\n');
  const { data: cards, error } = await supabase
    .from('lck_cards')
    .select('id, year, team, name, image')
    .order('year', { ascending: false });
  
  if (error) {
    console.error('❌ DB 조회 실패:', error);
    return;
  }
  
  console.log(`✅ ${cards.length}개 카드 조회 완료!\n`);
  
  // 2. 각 카드에 대해 이미지 찾기
  let foundCount = 0;
  let notFoundCount = 0;
  let alreadyHasImage = 0;
  let updatedCount = 0;
  
  const updateBatch = [];
  
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    
    console.log(`\n[${i + 1}/${cards.length}] ${card.id}`);
    
    // 이미 이미지가 있으면 스킵 (필요하면 이 부분 주석처리)
    if (card.image) {
      console.log(`  ⏭️  이미 이미지 있음: ${card.image}`);
      alreadyHasImage++;
      continue;
    }
    
    // 이미지 찾기
    const imageUrl = await findImageForCard(card);
    
    if (imageUrl) {
      foundCount++;
      updateBatch.push({ id: card.id, image: imageUrl });
    } else {
      notFoundCount++;
    }
    
    // 10개마다 업데이트 (API 부하 분산)
    if (updateBatch.length >= 10) {
      console.log(`\n💾 ${updateBatch.length}개 카드 업데이트 중...`);
      
      for (const update of updateBatch) {
        const { error: updateError } = await supabase
          .from('lck_cards')
          .update({ image: update.image })
          .eq('id', update.id);
        
        if (updateError) {
          console.error(`  ❌ ${update.id} 업데이트 실패:`, updateError);
        } else {
          updatedCount++;
        }
      }
      
      updateBatch.length = 0; // 배열 비우기
      console.log(`✅ 업데이트 완료! (총 ${updatedCount}개)\n`);
    }
  }
  
  // 남은 업데이트 처리
  if (updateBatch.length > 0) {
    console.log(`\n💾 마지막 ${updateBatch.length}개 카드 업데이트 중...`);
    
    for (const update of updateBatch) {
      const { error: updateError } = await supabase
        .from('lck_cards')
        .update({ image: update.image })
        .eq('id', update.id);
      
      if (updateError) {
        console.error(`  ❌ ${update.id} 업데이트 실패:`, updateError);
      } else {
        updatedCount++;
      }
    }
    
    console.log(`✅ 업데이트 완료!\n`);
  }
  
  // 3. 결과 요약
  console.log('\n' + '='.repeat(50));
  console.log('📊 매칭 결과 요약');
  console.log('='.repeat(50));
  console.log(`총 카드 수:        ${cards.length}개`);
  console.log(`이미 이미지 있음:  ${alreadyHasImage}개`);
  console.log(`✅ 이미지 찾음:    ${foundCount}개`);
  console.log(`❌ 이미지 없음:    ${notFoundCount}개`);
  console.log(`💾 DB 업데이트:    ${updatedCount}개`);
  console.log('='.repeat(50));
  console.log('\n✨ 완료!\n');
}

main().catch(console.error);
