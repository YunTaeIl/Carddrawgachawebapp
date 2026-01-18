// Supabase Storage 대량 이미지 업로드 스크립트
// 
// 사용법:
// 1. npm install @supabase/supabase-js
// 2. .env 파일에 SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY 설정
// 3. node scripts/upload-images.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 환경 변수에서 Supabase 정보 가져오기
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

// 선수 이미지 업로드
async function uploadPlayerImages() {
  console.log('📸 선수 이미지 업로드 시작...\n');
  
  const playersFolder = './images/players'; // 로컬 이미지 폴더 경로
  
  if (!fs.existsSync(playersFolder)) {
    console.error(`❌ 폴더가 없습니다: ${playersFolder}`);
    console.log('💡 ./images/players/ 폴더를 만들고 이미지를 넣어주세요.');
    return;
  }
  
  // 연도별 폴더 순회 (2020, 2021, ..., 2025)
  const years = fs.readdirSync(playersFolder).filter(f => 
    fs.statSync(path.join(playersFolder, f)).isDirectory()
  );
  
  let totalUploaded = 0;
  let totalFailed = 0;
  
  for (const year of years) {
    const yearFolder = path.join(playersFolder, year);
    const files = fs.readdirSync(yearFolder).filter(f => 
      /\.(png|jpg|jpeg|webp)$/i.test(f)
    );
    
    console.log(`📁 ${year}년: ${files.length}개 파일 업로드 중...`);
    
    for (const file of files) {
      const filePath = path.join(yearFolder, file);
      const fileBuffer = fs.readFileSync(filePath);
      
      // Supabase Storage 경로: players/2025/faker.png
      const storagePath = `${year}/${file}`;
      
      try {
        const { data, error } = await supabase.storage
          .from('lck-player-images')
          .upload(storagePath, fileBuffer, {
            contentType: getContentType(file),
            upsert: true // 덮어쓰기 허용
          });
        
        if (error) {
          console.error(`  ❌ ${file}: ${error.message}`);
          totalFailed++;
        } else {
          console.log(`  ✅ ${file}`);
          totalUploaded++;
        }
      } catch (err) {
        console.error(`  ❌ ${file}: ${err.message}`);
        totalFailed++;
      }
    }
    
    console.log('');
  }
  
  console.log(`\n📊 업로드 완료!`);
  console.log(`  ✅ 성공: ${totalUploaded}개`);
  console.log(`  ❌ 실패: ${totalFailed}개\n`);
}

// 팀 로고 업로드
async function uploadTeamLogos() {
  console.log('🏆 팀 로고 업로드 시작...\n');
  
  const logosFolder = './images/team-logos';
  
  if (!fs.existsSync(logosFolder)) {
    console.error(`❌ 폴더가 없습니다: ${logosFolder}`);
    console.log('💡 ./images/team-logos/ 폴더를 만들고 로고를 넣어주세요.');
    return;
  }
  
  const years = fs.readdirSync(logosFolder).filter(f => 
    fs.statSync(path.join(logosFolder, f)).isDirectory()
  );
  
  let totalUploaded = 0;
  let totalFailed = 0;
  
  for (const year of years) {
    const yearFolder = path.join(logosFolder, year);
    const files = fs.readdirSync(yearFolder).filter(f => 
      /\.(png|jpg|jpeg|svg|webp)$/i.test(f)
    );
    
    console.log(`📁 ${year}년: ${files.length}개 파일 업로드 중...`);
    
    for (const file of files) {
      const filePath = path.join(yearFolder, file);
      const fileBuffer = fs.readFileSync(filePath);
      
      const storagePath = `${year}/${file}`;
      
      try {
        const { data, error } = await supabase.storage
          .from('team-logos')
          .upload(storagePath, fileBuffer, {
            contentType: getContentType(file),
            upsert: true
          });
        
        if (error) {
          console.error(`  ❌ ${file}: ${error.message}`);
          totalFailed++;
        } else {
          console.log(`  ✅ ${file}`);
          totalUploaded++;
        }
      } catch (err) {
        console.error(`  ❌ ${file}: ${err.message}`);
        totalFailed++;
      }
    }
    
    console.log('');
  }
  
  console.log(`\n📊 업로드 완료!`);
  console.log(`  ✅ 성공: ${totalUploaded}개`);
  console.log(`  ❌ 실패: ${totalFailed}개\n`);
}

// 파일 확장자로 Content-Type 결정
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };
  return types[ext] || 'image/png';
}

// 메인 실행
async function main() {
  console.log('🚀 Supabase Storage 업로드 시작!\n');
  console.log(`📍 URL: ${supabaseUrl}\n`);
  
  const args = process.argv.slice(2);
  
  if (args.includes('--players')) {
    await uploadPlayerImages();
  } else if (args.includes('--logos')) {
    await uploadTeamLogos();
  } else {
    // 둘 다 업로드
    await uploadPlayerImages();
    await uploadTeamLogos();
  }
  
  console.log('✨ 모든 작업 완료!\n');
}

main().catch(console.error);
