import React, { useState } from "react";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus, X, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";

interface PatchNotesProps {
  isOpen: boolean;
  onClose: () => void;
}

// 패치 데이터 타입
interface PatchNote {
  version: string;
  date: string;
  title: string;
  content: React.ReactNode;
}

export function PatchNotes({ isOpen, onClose }: PatchNotesProps) {
  const [expandedVersion, setExpandedVersion] = useState<string>("v1.5.0");

  // 패치노트 데이터 (최신순)
  const patchNotes: PatchNote[] = [
    {
      version: "v1.5.0",
      date: "2026-03-02",
      title: "🔥 LIVE 카드 밸런스 패치 - LCK Cup 2026 최종 반영 / 🛡️ 강화 복구 시스템",
      content: <PatchV150 />
    },
    {
      version: "v1.4.0",
      date: "2026-02-23",
      title: "🔥 LIVE 카드 밸런스 패치 - 플레이오프 반영",
      content: <PatchV140 />
    },
    {
      version: "v1.3.0",
      date: "2026-02-10",
      title: "도감 시스템 추가",
      content: <PatchV130 />
    },
    {
      version: "v1.2.0",
      date: "2026-02-08",
      title: "LIVE 카드 밸런스 패치 (LCK Cup 2026)",
      content: <PatchV120 />
    },
    {
      version: "v1.1.0",
      date: "2026-02-03",
      title: "편의성 패치 및 버그 수정",
      content: <PatchV110 />
    },
    {
      version: "v1.0.0",
      date: "2026-02-02",
      title: "LIVE 카드 밸런스 패치",
      content: <PatchV100 />
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[#0F1629] border border-[#2A3A67] p-0">
      <DialogTitle className="sr-only">Legends Manager 패치노트</DialogTitle>
      <DialogDescription className="sr-only">게임 업데이트 및 밸런스 패치 내역</DialogDescription>
      
      {/* 헤더 */}
      <div className="sticky top-0 bg-[#1A2347] border-b border-[#2A3A67] px-5 py-3 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              📋 Legends Manager 패치노트
            </h1>
            <p className="text-xs text-[#8B95B5] mt-0.5">
              최신 업데이트 • {patchNotes[0].date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#8B95B5] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      <div className="p-5 space-y-3">
        {/* 패치노트 목록 */}
        {patchNotes.map((patch) => (
          <div key={patch.version} className="bg-[#1A2347]/50 rounded-lg border border-[#2A3A67]/50 overflow-hidden">
            {/* 패치 헤더 */}
            <button
              onClick={() => setExpandedVersion(expandedVersion === patch.version ? "" : patch.version)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#1A2347] transition-colors"
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold text-white">{patch.version}</span>
                  <span className="text-xs text-[#8B95B5]">{patch.date}</span>
                  {patch.version === patchNotes[0].version && (
                    <span className="text-[10px] bg-[#00FF00]/20 text-[#00FF00] px-1.5 py-0.5 rounded font-semibold border border-[#00FF00]/30">
                      NEW
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#8B95B5]">{patch.title}</div>
              </div>
              <div className="text-[#8B95B5]">
                {expandedVersion === patch.version ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {/* 패치 내용 */}
            {expandedVersion === patch.version && (
              <div className="px-4 pb-4 border-t border-[#2A3A67]/30">
                {patch.content}
              </div>
            )}
          </div>
        ))}
      </div>
      </DialogContent>
    </Dialog>
  );
}

// ==================== v1.5.0 패치 ====================
function PatchV150() {
  return (
    <div className="space-y-3 mt-3">
      {/* 조정 사유 */}
      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
        <div className="text-xs font-semibold text-white mb-2">🎯 조정 사유</div>
        <ul className="text-[11px] text-[#8B95B5] space-y-1 list-disc list-inside">
          <li><span className="text-white font-medium">LCK Cup 2026 최종 순위/성적 반영 기준으로 카드 밸런스 재조정</span></li>
          <li><span className="text-[#8B95B5]">변경 대상 컬럼은 동일하게 유지</span></li>
          <li><span className="text-[#FFB81C]">등급 구간 규칙 적용</span>
            <div className="ml-4 mt-0.5 text-white">S: 93~99 / A: 85~92 / B: 73~84 / C: 60~72</div>
          </li>
          <li><span className="text-white font-medium">S 등급 6장 유지 (패치 전/후 모두 S=6)</span></li>
        </ul>
      </div>

      {/* 변경 범위 요약 */}
      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
        <div className="text-xs font-semibold text-white mb-2">✅ 변경 범위 요약</div>
        <ul className="text-[11px] text-[#8B95B5] space-y-1 list-disc list-inside">
          <li><span className="text-white font-medium">총 55장 중 45장이 변경됨</span> (OVR 또는 스탯 기준)</li>
          <li><span className="text-[#8B95B5]">OVR 변경 43장 / OVR은 그대로인데 스탯만 바뀐 카드 2장 (하한/상한 캡 영향)</span></li>
          <li><span className="text-[#FFB81C]">등급 분포 변화</span>
            <div className="ml-4 mt-0.5 text-[#8B95B5]">이전: S 6 / A 17 / B 23 / C 9</div>
            <div className="ml-4 mt-0.5 text-white font-medium">변경: S 6 / A 16 / B 19 / C 14</div>
          </li>
          <li><span className="text-[#8B95B5]">OVR 변화 폭 분포 (55장)</span>
            <div className="ml-4 mt-0.5 text-white text-[10px]">+4(1명) · +3(4명) · +2(5명) · +1(5명) · 0(12명) · -1(6명) · -2(6명) · -3(11명) · -5(5명)</div>
          </li>
        </ul>
      </div>

      {/* S 등급 목록 */}
      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#FFD700]/20">
        <div className="text-xs font-semibold text-white mb-2">👑 S 등급 목록 (총 6장)</div>
        <div className="space-y-1.5">
          <div>
            <div className="text-[10px] text-[#FFD700] mb-1">Gen.G (5장)</div>
            <div className="flex flex-wrap gap-1 text-[11px]">
              <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Canyon (JGL) – 99 <span className="text-[#00FF00] text-[10px]">(+1)</span></span>
              <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Chovy (MID) – 99 <span className="text-[#00FF00] text-[10px]">(+3)</span></span>
              <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Duro (SUP) – 99 <span className="text-[#8B95B5] text-[10px]">(0/캡)</span></span>
              <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Kiin (TOP) – 99 <span className="text-[#00FF00] text-[10px]">(+4)</span></span>
              <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Ruler (ADC) – 99 <span className="text-[#8B95B5] text-[10px]">(0/캡)</span></span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#FFD700] mb-1">BNK FEARX (1장)</div>
            <div className="flex flex-wrap gap-1 text-[11px]">
              <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">VicLa (MID) – 96 <span className="text-[#00FF00] text-[10px]">(+3)</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* 등급 변동자 */}
      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
        <div className="text-xs font-semibold text-white mb-2">⚡ 등급 변동 선수 (총 6명)</div>
        <div className="text-[10px] text-[#8B95B5] mb-2">A→B 1명 / B→C 5명</div>
        
        <div className="space-y-2">
          {/* A → B */}
          <div className="bg-[#FF4444]/5 rounded p-2 border border-[#FF4444]/20">
            <div className="text-[10px] text-[#FF4444] font-semibold mb-1.5">🔻 A → B (1명)</div>
            <div className="space-y-1 text-[11px] text-white ml-2">
              <div className="flex items-center justify-between">
                <span>Namgung (HANJIN BRION / SUP)</span>
                <span className="text-[#FF4444] text-[10px]">A 87 → B 84 (▼3)</span>
              </div>
            </div>
          </div>

          {/* B → C */}
          <div className="bg-[#FF4444]/5 rounded p-2 border border-[#FF4444]/20">
            <div className="text-[10px] text-[#FF4444] font-semibold mb-1.5">⬇️ B → C (5명)</div>
            <div className="space-y-1 text-[11px] text-white ml-2">
              <div className="flex items-center justify-between">
                <span>Kanavi (HLE / JGL)</span>
                <span className="text-[#FF4444] text-[10px]">B 73 → C 68 (▼5)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Zeka (HLE / MID)</span>
                <span className="text-[#FF4444] text-[10px]">B 73 → C 68 (▼5)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Zeus (HLE / TOP)</span>
                <span className="text-[#FF4444] text-[10px]">B 75 → C 70 (▼5)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Aiming (KT Rolster / ADC)</span>
                <span className="text-[#FF4444] text-[10px]">B 74 → C 71 (▼3)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>PerfecT (KT Rolster / TOP)</span>
                <span className="text-[#FF4444] text-[10px]">B 74 → C 71 (▼3)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OVR 상승/하락 TOP 5 */}
      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
        <div className="text-xs font-semibold text-white mb-2">🔥 OVR 상승 TOP 5</div>
        <div className="space-y-1 text-[11px] text-white ml-2">
          <div className="flex items-center justify-between">
            <span>Kiin (Gen.G / TOP)</span>
            <span className="text-[#00FF00] text-[10px]">95 → 99 (+4)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Clear (BNK FEARX / TOP)</span>
            <span className="text-[#00FF00] text-[10px]">88 → 91 (+3)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Raptor (BNK FEARX / JGL)</span>
            <span className="text-[#00FF00] text-[10px]">86 → 89 (+3)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>VicLa (BNK FEARX / MID)</span>
            <span className="text-[#00FF00] text-[10px]">93 → 96 (+3)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Chovy (Gen.G / MID)</span>
            <span className="text-[#00FF00] text-[10px]">96 → 99 (+3)</span>
          </div>
        </div>
      </div>

      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
        <div className="text-xs font-semibold text-white mb-2">❄️ OVR 하락 TOP 5</div>
        <div className="text-[10px] text-[#8B95B5] mb-1.5">(전원 -5로 동일)</div>
        <div className="space-y-1 text-[11px] text-white ml-2">
          <div className="flex items-center justify-between">
            <span>Delight (HLE / SUP)</span>
            <span className="text-[#FF4444] text-[10px]">78 → 73 (-5)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Zeus (HLE / TOP)</span>
            <span className="text-[#FF4444] text-[10px]">75 → 70 (-5)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Zeka (HLE / MID)</span>
            <span className="text-[#FF4444] text-[10px]">73 → 68 (-5)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Kanavi (HLE / JGL)</span>
            <span className="text-[#FF4444] text-[10px]">73 → 68 (-5)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Gumayusi (HLE / ADC)</span>
            <span className="text-[#FF4444] text-[10px]">79 → 74 (-5)</span>
          </div>
        </div>
      </div>

      {/* 팀별 평균 OVR 변동 */}
      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
        <div className="text-xs font-semibold text-white mb-2">📊 팀별 평균 OVR 변동</div>
        <div className="space-y-1">
          {/* 상승 팀 */}
          <div className="bg-[#00FF00]/10 px-2 py-1.5 rounded border border-[#00FF00]/30">
            <div className="flex items-center justify-between text-[11px]">
              <div className="text-white font-medium">Gen.G</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">97.4 → 99.0</span>
                <span className="text-[#00FF00] font-semibold">(▲1.6)</span>
              </div>
            </div>
          </div>
          <div className="bg-[#00FF00]/10 px-2 py-1.5 rounded border border-[#00FF00]/30">
            <div className="flex items-center justify-between text-[11px]">
              <div className="text-white font-medium">BNK FEARX</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">90.0 → 92.0</span>
                <span className="text-[#00FF00] font-semibold">(▲2.0)</span>
              </div>
            </div>
          </div>
          <div className="bg-[#00FF00]/10 px-2 py-1.5 rounded border border-[#00FF00]/30">
            <div className="flex items-center justify-between text-[11px]">
              <div className="text-white font-medium">Dplus Kia</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">89.6 → 91.0</span>
                <span className="text-[#00FF00] font-semibold">(▲1.4)</span>
              </div>
            </div>
          </div>
          <div className="bg-[#00FF00]/10 px-2 py-1.5 rounded border border-[#00FF00]/30">
            <div className="flex items-center justify-between text-[11px]">
              <div className="text-white font-medium">T1</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">89.2 → 90.4</span>
                <span className="text-[#00FF00] font-semibold">(▲1.2)</span>
              </div>
            </div>
          </div>

          {/* 무변동 */}
          <div className="bg-[#8B95B5]/10 px-2 py-1.5 rounded border border-[#8B95B5]/30">
            <div className="flex items-center justify-between text-[11px]">
              <div className="text-white font-medium">DN SOOPers</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">78.2 → 78.2</span>
                <span className="text-[#8B95B5] font-semibold">(0.0)</span>
              </div>
            </div>
          </div>

          {/* 하락 팀 */}
          <div className="bg-[#FF4444]/10 px-2 py-1.5 rounded border border-[#FF4444]/30">
            <div className="flex items-center justify-between text-[11px]">
              <div className="text-white font-medium">DRX</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">77.3 → 76.3</span>
                <span className="text-[#FF4444] font-semibold">(▼1.0)</span>
              </div>
            </div>
          </div>
          <div className="bg-[#FF4444]/10 px-2 py-1.5 rounded border border-[#FF4444]/30">
            <div className="flex items-center justify-between text-[11px]">
              <div className="text-white font-medium">Nongshim RedForce</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">73.8 → 72.2</span>
                <span className="text-[#FF4444] font-semibold">(▼1.7)</span>
              </div>
            </div>
          </div>
          <div className="bg-[#FF4444]/10 px-2 py-1.5 rounded border border-[#FF4444]/30">
            <div className="flex items-center justify-between text-[11px]">
              <div className="text-white font-medium">KT Rolster</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">74.5 → 71.5</span>
                <span className="text-[#FF4444] font-semibold">(▼3.0)</span>
              </div>
            </div>
          </div>
          <div className="bg-[#FF4444]/10 px-2 py-1.5 rounded border border-[#FF4444]/30">
            <div className="flex items-center justify-between text-[11px]">
              <div className="text-white font-medium">HANJIN BRION</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">74.0 → 71.2</span>
                <span className="text-[#FF4444] font-semibold">(▼2.8)</span>
              </div>
            </div>
          </div>
          <div className="bg-[#FF4444]/10 px-2 py-1.5 rounded border border-[#FF4444]/30">
            <div className="flex items-center justify-between text-[11px]">
              <div className="text-white font-medium">Hanwha Life Esports</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">75.6 → 70.6</span>
                <span className="text-[#FF4444] font-semibold">(▼5.0)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🛡️ 강화 복구 시스템 */}
      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#FFB81C]/30">
        <div className="text-xs font-semibold text-white mb-2">🛡️ 강화 복구 시스템 추가</div>
        <ul className="text-[11px] text-[#8B95B5] space-y-1 list-disc list-inside">
          <li><span className="text-white font-medium">강화 파괴(BREAK) 시 카드를 즉시 삭제하지 않고 복구 선택 가능</span></li>
          <li><span className="text-[#FFB81C]">복구 비용: 해당 카드 등급 상점 구매가의 1/10</span>
            <div className="ml-4 mt-1 space-y-0.5">
              <div className="text-[10px] text-white">일반 카드: C 400 / B 3,500 / A 7,000 / S 10,000 샤드</div>
              <div className="text-[10px] text-[#FF6B6B]">LIVE 카드: C 40,000 / B 350,000 / A 700,000 / S 1,000,000 샤드</div>
            </div>
          </li>
          <li><span className="text-white">복구 시 강화 레벨은 <span className="text-[#FFB81C] font-bold">+0으로 초기화</span></span></li>
          <li><span className="text-[#FF4444]">복구를 포기하면 카드가 영구 삭제됨</span></li>
          <li><span className="text-[#8B95B5]">파괴 모달은 외부 클릭으로 닫을 수 없음 (반드시 복구/포기 선택 필요)</span></li>
        </ul>
      </div>
    </div>
  );
}

// ==================== v1.4.0 패치 ====================
function PatchV140() {
  return (
    <div className="space-y-3 mt-3">
      {/* 조정 사유 */}
      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
        <div className="text-xs font-semibold text-white mb-2">🎯 조정 사유</div>
        <ul className="text-[11px] text-[#8B95B5] space-y-1 list-disc list-inside">
          <li><span className="text-white font-medium">2/23 이전 플레이오프 경기 결과 반영 필요함</span></li>
          <li><span className="text-[#FFB81C]">플옵/경기 진행 팀만 LIVE 밸런싱(OVR+스탯) 반영함</span>
            <div className="ml-4 mt-0.5 text-white">대상: Gen.G / BNK FEARX / DN SOOPers / T1 / DRX 적용함</div>
          </li>
          <li><span className="text-[#8B95B5]">경기/상태 변동 없는 팀은 0변동 유지함</span>
            <div className="ml-4 mt-0.5">Dplus Kia / Nongshim / KT / BRION / HLE 0변동 유지함</div>
          </li>
          <li><span className="text-white font-medium">컬럼 유지 정책 적용함</span>
            <div className="ml-4 mt-0.5 text-[#FFB81C]">변경: ovr, mechanics, laning, teamfight, macro, clutch만 변경함</div>
            <div className="ml-4 mt-0.5 text-[#8B95B5]">그 외 컬럼(id/year/team/position/name/image 등) 유지함</div>
          </li>
          <li><span className="text-white font-medium">등급/OVR 규칙 유지 및 자동 보정 적용함</span>
            <div className="ml-4 mt-0.5 text-[#FFB81C]">S: 93~99 / A: 85~92 / B: 73~84 / C: 60~72 적용함</div>
            <div className="ml-4 mt-0.5">OVR 변화로 구간 벗어난 카드 등급 자동 수정함</div>
          </li>
          <li><span className="text-white font-medium">전체 분포(자동수정 결과)</span>
            <div className="ml-4 mt-0.5 text-white">S 6 / A 17 / B 23 / C 9임</div>
            <div className="ml-4 mt-0.5 text-[#8B95B5] text-[10px]">(이번 버전은 A/B 분포가 예시(16/24)와 다름 — OVR구간 자동수정 결과임)</div>
          </li>
        </ul>
      </div>

      {/* S 등급 목록 */}
      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#FFD700]/20">
        <div className="text-xs font-semibold text-white mb-2">👑 S 등급 목록 (총 6장)</div>
        <div className="space-y-1.5">
          <div>
            <div className="text-[10px] text-[#FFD700] mb-1">Gen.G (5장)</div>
            <div className="flex flex-wrap gap-1 text-[11px]">
              <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Duro (SUP) – 99</span>
              <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Ruler (ADC) – 99</span>
              <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Canyon (JGL) – 98</span>
              <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Chovy (MID) – 96</span>
              <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Kiin (TOP) – 95</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#FFD700] mb-1">BNK FEARX (1장)</div>
            <div className="flex flex-wrap gap-1 text-[11px]">
              <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">VicLa (MID) – 93</span>
            </div>
          </div>
        </div>
      </div>

      {/* 등급 변동자 */}
      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
        <div className="text-xs font-semibold text-white mb-2">⚡ 등급 변동 선수 (총 3명)</div>
        <div className="text-[10px] text-[#8B95B5] mb-2">B→A 1명 / A→S 1명 / S→A 1명임</div>
        
        <div className="space-y-2">
          {/* 등급 상승 */}
          <div className="bg-[#00FF00]/5 rounded p-2 border border-[#00FF00]/20">
            <div className="text-[10px] text-[#00FF00] font-semibold mb-1.5">🔺 B → A (1명)</div>
            <div className="space-y-1 text-[11px] text-white ml-2">
              <div className="flex items-center justify-between">
                <span>Raptor (BNK FEARX / JGL)</span>
                <span className="text-[#00FF00] text-[10px]">84(B) → 86(A) (+2)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#FFD700]/10 rounded p-2 border border-[#FFD700]/30">
            <div className="text-[10px] text-[#FFD700] font-semibold mb-1.5">🔺 A → S (1명)</div>
            <div className="space-y-1 text-[11px] text-white ml-2">
              <div className="flex items-center justify-between">
                <span>VicLa (BNK FEARX / MID)</span>
                <span className="text-[#FFD700] text-[10px]">91(A) → 93(S) (+2)</span>
              </div>
            </div>
          </div>

          {/* 등급 하락 */}
          <div className="bg-[#FF4444]/5 rounded p-2 border border-[#FF4444]/20">
            <div className="text-[10px] text-[#FF4444] font-semibold mb-1.5">🔻 S → A (1명)</div>
            <div className="space-y-1 text-[11px] text-white ml-2">
              <div className="flex items-center justify-between">
                <span>Doran (T1 / TOP)</span>
                <span className="text-[#FF4444] text-[10px]">93(S) → 92(A) (-1)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 팀별 스탯 상세 변동 */}
      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
        <div className="text-xs font-semibold text-white mb-2">📊 팀별 스텟 상세 변동 (평균 OVR 기준)</div>
        
        {/* 변동 적용 팀 */}
        <div className="mb-3">
          <div className="text-[10px] text-[#FFB81C] font-semibold mb-1.5">🔧 변동 적용 팀</div>
          <div className="space-y-1">
            <div className="bg-[#00FF00]/10 px-2 py-1.5 rounded border border-[#00FF00]/30">
              <div className="flex items-center justify-between text-[11px]">
                <div className="text-white font-medium">BNK FEARX</div>
                <div className="flex items-center gap-2">
                  <span className="text-[#8B95B5]">88.0 → 90.0</span>
                  <span className="text-[#00FF00] font-semibold">(▲2.0)</span>
                </div>
              </div>
              <div className="text-[10px] text-[#8B95B5] mt-0.5">
                등급: A4·B1 → S1·A4 (VicLa S 진입, Raptor A 승급)
              </div>
            </div>

            <div className="bg-[#00FF00]/10 px-2 py-1.5 rounded border border-[#00FF00]/30">
              <div className="flex items-center justify-between text-[11px]">
                <div className="text-white font-medium">DN SOOPers</div>
                <div className="flex items-center gap-2">
                  <span className="text-[#8B95B5]">76.2 → 78.2</span>
                  <span className="text-[#00FF00] font-semibold">(▲2.0)</span>
                </div>
              </div>
              <div className="text-[10px] text-[#8B95B5] mt-0.5">
                등급 분포 유지(수치만 상향)
              </div>
            </div>

            <div className="bg-[#00FF00]/10 px-2 py-1.5 rounded border border-[#00FF00]/30">
              <div className="flex items-center justify-between text-[11px]">
                <div className="text-white font-medium">Gen.G</div>
                <div className="flex items-center gap-2">
                  <span className="text-[#8B95B5]">96.6 → 97.4</span>
                  <span className="text-[#00FF00] font-semibold">(▲0.8)</span>
                </div>
              </div>
              <div className="text-[10px] text-[#8B95B5] mt-0.5">
                S 5장 유지 (상한 99 캡으로 평균 상승폭 일부 제한됨)
              </div>
            </div>

            <div className="bg-[#FF4444]/10 px-2 py-1.5 rounded border border-[#FF4444]/30">
              <div className="flex items-center justify-between text-[11px]">
                <div className="text-white font-medium">T1</div>
                <div className="flex items-center gap-2">
                  <span className="text-[#8B95B5]">90.2 → 89.2</span>
                  <span className="text-[#FF4444] font-semibold">(▼1.0)</span>
                </div>
              </div>
              <div className="text-[10px] text-[#8B95B5] mt-0.5">
                등급: S1·A4 → A5 (Doran S→A로 변경됨)
              </div>
            </div>

            <div className="bg-[#FF4444]/10 px-2 py-1.5 rounded border border-[#FF4444]/30">
              <div className="flex items-center justify-between text-[11px]">
                <div className="text-white font-medium">DRX</div>
                <div className="flex items-center gap-2">
                  <span className="text-[#8B95B5]">79.3 → 77.3</span>
                  <span className="text-[#FF4444] font-semibold">(▼2.0)</span>
                </div>
              </div>
              <div className="text-[10px] text-[#8B95B5] mt-0.5">
                등급 분포 유지(수치만 하향)
              </div>
            </div>
          </div>
        </div>

        {/* 0변동 유지 팀 */}
        <div>
          <div className="text-[10px] text-[#8B95B5] font-semibold mb-1.5">✅ 0변동 유지 팀</div>
          <div className="space-y-1">
            <div className="text-[11px] bg-[#0F1629] px-2 py-1 rounded text-[#8B95B5]">
              Dplus Kia / Nongshim RedForce / KT Rolster / HANJIN BRION / Hanwha Life Esports
            </div>
            <div className="text-[10px] text-[#8B95B5] ml-2">
              평균 OVR 변동 없음(0.0) 유지함
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== v1.3.0 패치 ====================
function PatchV130() {
  return (
    <div className="space-y-3 mt-3">
      {/* 도감 시스템 */}
      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
        <div className="text-xs font-semibold text-white mb-2">📚 도감 시스템 추가</div>
        <ul className="text-[11px] text-[#8B95B5] space-y-1 list-disc list-inside">
          <li><span className="text-[#FFB81C] font-medium">한 번 획득한 카드는 도감에 영구 기록</span></li>
          <li><span className="text-white">가챠, 샤드 제작 등 모든 카드 획득 시 자동으로 도감에 등록</span></li>
          <li><span className="text-white">획득 카드는 도감에서 카드 형태로 확인 가능</span></li>
          <li><span className="text-[#8B95B5]">현재 소유: 밝게 표시 + ⭐ 체크 마크</span></li>
          <li><span className="text-[#8B95B5]">발견했지만 미소유: 약간 어둡게 + 📖 아이콘</span></li>
          <li><span className="text-[#8B95B5]">미발견: 잠금 상태 (???)</span></li>
        </ul>
      </div>

      {/* 도감 UI 개선 */}
      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
        <div className="text-xs font-semibold text-white mb-2">🎨 도감 UI 완전 리뉴얼</div>
        <ul className="text-[11px] text-[#8B95B5] space-y-1 list-disc list-inside">
          <li><span className="text-white font-medium">기존 썸네일 방식 → 실제 카드 형태로 변경</span></li>
          <li><span className="text-white">LCKHoloCard 컴포넌트 사용으로 일관된 카드 디자인</span></li>
          <li><span className="text-white">카드 클릭 시 상세 모달로 카드 앞/뒷면 확인 가능</span></li>
          <li><span className="text-[#2B6CFF]">발견률과 보유율을 별도로 표시</span></li>
        </ul>
      </div>

      {/* 기술적 변경사항 */}
      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
        <div className="text-xs font-semibold text-white mb-2">⚙️ 기술적 변경사항</div>
        <ul className="text-[11px] text-[#8B95B5] space-y-1 list-disc list-inside">
          <li><span className="text-white">서버 API: <code className="text-[#FFB81C] bg-[#0F1629] px-1 rounded">/codex/discover</code> 추가 (카드 발견 기록)</span></li>
          <li><span className="text-white">서버 API: <code className="text-[#FFB81C] bg-[#0F1629] px-1 rounded">/codex</code> 추가 (도감 조회)</span></li>
          <li><span className="text-white">DB: kv_store 활용 (<code className="text-[#2B6CFF] bg-[#0F1629] px-1 rounded">codex:{"{userId}"}</code> 키)</span></li>
          <li><span className="text-[#8B95B5]">가챠 1회, 10연, 샤드 제작 모두 자동으로 도감 기록</span></li>
        </ul>
      </div>

      {/* 장점 */}
      <div className="bg-gradient-to-r from-[#2B6CFF]/10 to-[#2B6CFF]/5 rounded-lg p-3 border border-[#2B6CFF]/20">
        <div className="text-xs font-semibold text-[#2B6CFF] mb-2">✨ 이점</div>
        <ul className="text-[11px] text-white space-y-1 list-disc list-inside">
          <li>카드를 처분해도 도감에는 영구 보존</li>
          <li>수집 진행도를 한눈에 확인 가능</li>
          <li>도감에서 카드를 실제 카드 형태로 확인 가능</li>
          <li>컬렉션의 재미 요소 추가</li>
        </ul>
      </div>
    </div>
  );
}

// ==================== v1.2.0 패치 ====================
function PatchV120() {
  return (
    <div className="space-y-3 mt-3">
      {/* 조정 사유 */}
      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
        <div className="text-xs font-semibold text-white mb-2">🎯 조정 사유</div>
        <ul className="text-[11px] text-[#8B95B5] space-y-1 list-disc list-inside">
          <li><span className="text-white font-medium">2/6~2/8 경기 진행 팀만 LIVE 밸런싱 반영</span></li>
          <li><span className="text-[#8B95B5]">경기 미진행 팀은 스탯 변동 0으로 고정</span>
            <div className="ml-4 mt-0.5 text-[#FFB81C]">Gen.G / T1 / BNK FEARX 고정</div>
          </li>
          <li><span className="text-[#FF6666]">이미 탈락한 Hanwha Life Esports도 고정</span></li>
          <li><span className="text-white font-medium">경기 진행 팀 중 탈락 팀(BRO/KT/NS)은 결과 반영으로 전반 하향 발생</span></li>
          <li><span className="text-white font-medium">등급/OVR 규칙 유지</span>
            <div className="ml-4 mt-0.5 text-[#FFB81C]">S: 93~99 / A: 85~92 / B: 73~84 / C: 60~72</div>
          </li>
          <li><span className="text-white font-medium">전체 분포: S 6 / A 16 / B 24 / C 9 유지</span></li>
        </ul>
      </div>

      {/* S 등급 목록 */}
      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#FFD700]/20">
        <div className="text-xs font-semibold text-white mb-2">👑 S 등급 목록 (6장 고정)</div>
        <div className="space-y-1.5">
          <div>
            <div className="text-[10px] text-[#FFD700] mb-1">Gen.G (5장)</div>
            <div className="flex flex-wrap gap-1 text-[11px]">
              <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Duro (SUP) – 99</span>
              <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Ruler (ADC) – 98</span>
              <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Canyon (JGL) – 97</span>
              <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Chovy (MID) – 95</span>
              <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Kiin (TOP) – 94</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#FFD700] mb-1">T1 (1장)</div>
            <div className="flex flex-wrap gap-1 text-[11px]">
              <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Doran (TOP) – 93</span>
            </div>
          </div>
        </div>
      </div>

      {/* 등급 변동자 */}
      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
        <div className="text-xs font-semibold text-white mb-2">⚡ 등급 변동 선수 (총 15명)</div>
        <div className="text-[10px] text-[#8B95B5] mb-2">B→A 3명 / A→B 3명 / C→B 4명 / B→C 5명</div>
        
        <div className="space-y-2">
          {/* B→A */}
          <div className="bg-[#00FF00]/5 rounded p-2 border border-[#00FF00]/20">
            <div className="text-[10px] text-[#00FF00] font-semibold mb-1.5">🔺 B → A (3명)</div>
            <div className="space-y-1 text-[11px] text-white ml-2">
              <div className="flex items-center justify-between">
                <span>Namgung (HANJIN BRION / SUP)</span>
                <span className="text-[#00FF00] text-[10px]">76 → 87 (+11)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Jiwoo (DRX / ADC)</span>
                <span className="text-[#00FF00] text-[10px]">79 → 88 (+9)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>DuDu (DN SOOPers / TOP)</span>
                <span className="text-[#00FF00] text-[10px]">78 → 85 (+7)</span>
              </div>
            </div>
          </div>

          {/* A→B */}
          <div className="bg-[#FF4444]/5 rounded p-2 border border-[#FF4444]/20">
            <div className="text-[10px] text-[#FF4444] font-semibold mb-1.5">🔻 A → B (3명)</div>
            <div className="space-y-1 text-[11px] text-white ml-2">
              <div className="flex items-center justify-between">
                <span>Scout (Nongshim RedForce / MID)</span>
                <span className="text-[#FF4444] text-[10px]">85 → 78 (-7)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Bdd (KT Rolster / MID)</span>
                <span className="text-[#FF4444] text-[10px]">87 → 77 (-10)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cuzz (KT Rolster / JGL)</span>
                <span className="text-[#FF4444] text-[10px]">90 → 79 (-11)</span>
              </div>
            </div>
          </div>

          {/* C→B */}
          <div className="bg-[#88FF88]/5 rounded p-2 border border-[#88FF88]/20">
            <div className="text-[10px] text-[#88FF88] font-semibold mb-1.5">⬆️ C → B (4명)</div>
            <div className="space-y-1 text-[11px] text-white ml-2">
              <div className="flex items-center justify-between">
                <span>Fisher (HANJIN BRION / MID)</span>
                <span className="text-[#88FF88] text-[10px]">60 → 82 (+22)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Vincenzo (DRX / JGL)</span>
                <span className="text-[#88FF88] text-[10px]">62 → 83 (+21)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Calix (Nongshim RedForce / MID)</span>
                <span className="text-[#88FF88] text-[10px]">63 → 81 (+18)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Life (DN SOOPers / SUP)</span>
                <span className="text-[#88FF88] text-[10px]">70 → 73 (+3)</span>
              </div>
            </div>
          </div>

          {/* B→C */}
          <div className="bg-[#FF6666]/5 rounded p-2 border border-[#FF6666]/20">
            <div className="text-[10px] text-[#FF6666] font-semibold mb-1.5">⬇️ B → C (5명)</div>
            <div className="space-y-1 text-[11px] text-white ml-2">
              <div className="flex items-center justify-between">
                <span>Kingen (Nongshim RedForce / TOP)</span>
                <span className="text-[#FF6666] text-[10px]">74 → 60 (-14)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pollu (KT Rolster / SUP)</span>
                <span className="text-[#FF6666] text-[10px]">77 → 64 (-13)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ucal (DRX / MID)</span>
                <span className="text-[#FF6666] text-[10px]">77 → 66 (-11)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Rich (DRX / TOP)</span>
                <span className="text-[#FF6666] text-[10px]">81 → 72 (-9)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Taeyoon (Nongshim RedForce / ADC)</span>
                <span className="text-[#FF6666] text-[10px]">78 → 70 (-8)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 팀별 스텟 상세 변동 */}
      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
        <div className="text-xs font-semibold text-white mb-2">📊 팀별 스텟 상세 변동</div>
        
        {/* 고정 팀 */}
        <div className="mb-3">
          <div className="text-[10px] text-[#8B95B5] font-semibold mb-1.5">✅ 고정 팀 (변동 없음)</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] bg-[#0F1629] px-2 py-1 rounded">
              <div className="text-white">Gen.G</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">96.6 → 96.6 (0.0)</span>
                <span className="text-[#8B95B5] text-[10px]">S 5장 유지</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] bg-[#0F1629] px-2 py-1 rounded">
              <div className="text-white">T1</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">90.2 → 90.2 (0.0)</span>
                <span className="text-[#8B95B5] text-[10px]">S 1 · A 4 유지</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] bg-[#0F1629] px-2 py-1 rounded">
              <div className="text-white">BNK FEARX</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">88.0 → 88.0 (0.0)</span>
                <span className="text-[#8B95B5] text-[10px]">A 4 · B 1 유지</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] bg-[#0F1629] px-2 py-1 rounded">
              <div className="text-white">Hanwha Life Esports</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">75.6 → 75.6 (0.0)</span>
                <span className="text-[#8B95B5] text-[10px]">B 5장 유지</span>
              </div>
            </div>
          </div>
        </div>

        {/* 경기 진행 팀 */}
        <div>
          <div className="text-[10px] text-[#FFB81C] font-semibold mb-1.5">🔧 경기 진행 팀 (조정 반영)</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] bg-[#FF4444]/10 px-2 py-1 rounded border border-[#FF4444]/30">
              <div className="text-white font-medium">KT Rolster (탈락)</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">82.8 → 74.5</span>
                <span className="text-[#FF4444] font-semibold">(▼8.3)</span>
              </div>
            </div>
            <div className="text-[10px] text-[#8B95B5] ml-2 mb-1.5">등급 A 2 · B 4 → B 5 · C 1 하향</div>

            <div className="flex items-center justify-between text-[11px] bg-[#FF4444]/10 px-2 py-1 rounded border border-[#FF4444]/30">
              <div className="text-white font-medium">Nongshim RedForce (탈락)</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">77.8 → 73.8</span>
                <span className="text-[#FF4444] font-semibold">(▼4.0)</span>
              </div>
            </div>
            <div className="text-[10px] text-[#8B95B5] ml-2 mb-1.5">등급 A 1 · B 4 · C 1 → B 4 · C 2 하향</div>

            <div className="flex items-center justify-between text-[11px] bg-[#00FF00]/10 px-2 py-1 rounded border border-[#00FF00]/30">
              <div className="text-white font-medium">DRX</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">77.3 → 79.3</span>
                <span className="text-[#00FF00] font-semibold">(▲2.0)</span>
              </div>
            </div>
            <div className="text-[10px] text-[#8B95B5] ml-2 mb-1.5">등급 B 5 · C 1 → A 1 · B 3 · C 2 재배치</div>

            <div className="flex items-center justify-between text-[11px] bg-[#00FF00]/10 px-2 py-1 rounded border border-[#00FF00]/30">
              <div className="text-white font-medium">DN SOOPers (DNS)</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">74.3 → 76.2</span>
                <span className="text-[#00FF00] font-semibold">(▲1.8)</span>
              </div>
            </div>
            <div className="text-[10px] text-[#8B95B5] ml-2 mb-1.5">등급 B 4 · C 2 → A 1 · B 4 · C 1 개선</div>

            <div className="flex items-center justify-between text-[11px] bg-[#00FF00]/10 px-2 py-1 rounded border border-[#00FF00]/30">
              <div className="text-white font-medium">Dplus Kia (DK)</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">88.0 → 89.6</span>
                <span className="text-[#00FF00] font-semibold">(▲1.6)</span>
              </div>
            </div>
            <div className="text-[10px] text-[#8B95B5] ml-2 mb-1.5">등급 A 5장 유지 (수치만 상향)</div>

            <div className="flex items-center justify-between text-[11px] bg-[#00FF00]/10 px-2 py-1 rounded border border-[#00FF00]/30">
              <div className="text-white font-medium">HANJIN BRION (BRO, 탈락)</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">69.3 → 74.0</span>
                <span className="text-[#00FF00] font-semibold">(▲4.7)</span>
              </div>
            </div>
            <div className="text-[10px] text-[#8B95B5] ml-2">등급 B 2 · C 4 → A 1 · B 2 · C 3 개선</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== v1.1.0 패치 ====================
function PatchV110() {
  return (
    <div className="space-y-3 mt-3">
      <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
        <div className="text-xs font-semibold text-white mb-2">🎯 업데이트 내용</div>
        <ul className="text-[11px] text-[#8B95B5] space-y-2 list-disc list-inside">
          <li>
            <span className="text-white font-medium">선수 관리 필터 개선</span>
            <div className="ml-5 mt-1 text-[10px] space-y-0.5">
              <div>• 모든 필터(연도/등급/포지션/팀)를 체크박스로 변경</div>
              <div>• 여러 항목 동시 선택 가능</div>
              <div className="text-[#00FF00]">• 필터 설정이 자동으로 저장되어 다음 방문시에도 유지</div>
            </div>
          </li>
          <li>
            <span className="text-white font-medium">리그 시스템 버그 수정</span>
            <div className="ml-5 mt-1 text-[10px] space-y-0.5">
              <div>• 플레이오프 종료 후 "새 시즌 시작" 버튼 클릭 시 빈 화면이 나오는 버그 수정</div>
              <div>• 리그 포기 시 화면 전환 오류 수정</div>
              <div className="text-[#8B95B5]">• DB 삭제 후 안전한 화면 전환을 위한 딜레이 추가</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

// ==================== v1.0.0 패치 ====================
function PatchV100() {
  return (
    <div className="space-y-3 mt-3">
        {/* 조정 사유 */}
        <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
          <div className="text-xs font-semibold text-white mb-2">🎯 조정 사유</div>
          <ul className="text-[11px] text-[#8B95B5] space-y-1 list-disc list-inside">
            <li><span className="text-white font-medium">LCK Cup 2026 최신 경기 결과 및 선수 지표 반영</span> (데이터 기준: GOL.GG LCK Cup 2026 공식 통계)</li>
            <li><span className="text-white font-medium">LIVE 카드 등급/OVR 분포 고정 정책 적용</span>
              <div className="ml-4 mt-0.5 text-[#FFB81C]">S: 93~99 / A: 85~92 / B: 73~84 / C: 60~72</div>
            </li>
            <li><span className="text-white font-medium">전체 카드 수 기준 등급 비율 재조정</span>
              <div className="ml-4 mt-0.5 text-white">S 6장 / A 16장 / B 25장 / C 8장</div>
            </li>
            <li><span className="text-[#FF4444] font-medium">Hanwha Life Esports LCK Cup 탈락 반영</span>
              <div className="ml-4 mt-0.5">해당 팀은 이후 추가 경기 없음 → 팀 성적 및 컵 탈락 상태 반영해 전원 하향 조정 후 OVR 고정 처리</div>
            </li>
            <li className="text-[#8B95B5]">기준 로스터는 GOL.GG LCK Cup 2026 페이지에 등록된 선수만 사용</li>
          </ul>
        </div>

        {/* S 등급 정원 */}
        <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#FFD700]/20">
          <div className="text-xs font-semibold text-white mb-2">👑 S 등급 카드 목록 (총 6장)</div>
          <div className="space-y-1.5">
            <div>
              <div className="text-[10px] text-[#FFD700] mb-1">Gen.G (5장)</div>
              <div className="flex flex-wrap gap-1 text-[11px]">
                <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Kiin (TOP) – 94</span>
                <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Canyon (JGL) – 97</span>
                <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Chovy (MID) – 95</span>
                <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Ruler (ADC) – 98</span>
                <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Duro (SUP) – 99</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#FFD700] mb-1">T1 (1장)</div>
              <div className="flex flex-wrap gap-1 text-[11px]">
                <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium border border-[#FFD700]/30">Doran (TOP) – 93</span>
              </div>
            </div>
          </div>
        </div>

        {/* 등급 변동자 */}
        <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
          <div className="text-xs font-semibold text-white mb-2">⚡ 등급 변동 선수</div>
          <div className="space-y-2">
            {/* 등급 상승 */}
            <div className="bg-[#00FF00]/5 rounded p-2 border border-[#00FF00]/20">
              <div className="text-[10px] text-[#00FF00] font-semibold mb-1.5">🔺 등급 상승</div>
              
              <div className="space-y-1.5">
                <div>
                  <div className="text-[10px] text-[#FFD700] font-semibold mb-0.5">A → S (1명)</div>
                  <div className="text-[11px] text-white ml-2">Doran (T1 / TOP)</div>
                </div>

                <div>
                  <div className="text-[10px] text-[#00FF00] font-semibold mb-0.5">B → A (6명)</div>
                  <div className="text-[11px] text-white ml-2 space-y-0.5">
                    <div>Kellin (BNK FEARX / SUP)</div>
                    <div>VicLa (BNK FEARX / MID)</div>
                    <div>Cuzz (KT / JGL)</div>
                    <div>Siwoo (Dplus KIA / TOP)</div>
                    <div>Clear (BNK FEARX / TOP)</div>
                    <div>Diable (BNK FEARX / ADC)</div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-[#88FF88] font-semibold mb-0.5">C → B (5명)</div>
                  <div className="text-[11px] text-white ml-2 space-y-0.5">
                    <div>Ghost (KT / SUP)</div>
                    <div>Willer (DRX / JGL)</div>
                    <div>Peter (DN SOOPers / SUP)</div>
                    <div>Namgung (BRO / SUP)</div>
                    <div>Casting (BRO / TOP)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 등급 하락 */}
            <div className="bg-[#FF4444]/5 rounded p-2 border border-[#FF4444]/20">
              <div className="text-[10px] text-[#FF4444] font-semibold mb-1.5">🔻 등급 하락</div>
              
              <div className="space-y-1.5">
                <div>
                  <div className="text-[10px] text-[#FF8844] font-semibold mb-0.5">S → A (1명)</div>
                  <div className="text-[11px] text-white ml-2">Oner (T1 / JGL)</div>
                </div>

                <div>
                  <div className="text-[10px] text-[#FF4444] font-semibold mb-0.5">A → B (9명, 한화생명 전원 포함)</div>
                  <div className="text-[11px] text-white ml-2 space-y-0.5">
                    <div className="text-[#FF6666]">Zeus (Hanwha Life Esports / TOP)</div>
                    <div className="text-[#FF6666]">Kanavi (Hanwha Life Esports / JGL)</div>
                    <div className="text-[#FF6666]">Zeka (Hanwha Life Esports / MID)</div>
                    <div className="text-[#FF6666]">Gumayusi (Hanwha Life Esports / ADC)</div>
                    <div className="text-[#FF6666]">Delight (Hanwha Life Esports / SUP)</div>
                    <div>Kingen (NS / TOP)</div>
                    <div>Pyosik (DN SOOPers / JGL)</div>
                    <div>Aiming (KT / ADC)</div>
                    <div>Lehends (NS / SUP)</div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-[#FF6666] font-semibold mb-0.5">B → C (4명)</div>
                  <div className="text-[11px] text-white ml-2 space-y-0.5">
                    <div>deokdam (DN SOOPers / ADC)</div>
                    <div>Teddy (BRO / ADC)</div>
                    <div>Life (DN SOOPers / SUP)</div>
                    <div>GIDEON (BRO / JGL)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 팀별 평균 OVR 변동 */}
        <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
          <div className="text-xs font-semibold text-white mb-2">📈 팀별 평균 OVR 변동</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] bg-[#FF4444]/10 px-2 py-1 rounded border border-[#FF4444]/30">
              <div className="text-white font-medium">Hanwha Life Esports</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">90.0 → 75.6</span>
                <span className="text-[#FF4444] font-semibold">(▼14.4)</span>
              </div>
            </div>
            <div className="text-[10px] text-[#8B95B5] ml-2 mb-1.5">등급 분포: A 5장 → B 5장 • 컵 탈락 팀으로 LIVE 카드 고정 대상 전환</div>

            <div className="flex items-center justify-between text-[11px] bg-[#00FF00]/10 px-2 py-1 rounded border border-[#00FF00]/30">
              <div className="text-white font-medium">BNK FEARX</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">82.4 → 88.0</span>
                <span className="text-[#00FF00] font-semibold">(▲5.6)</span>
              </div>
            </div>
            <div className="text-[10px] text-[#8B95B5] ml-2 mb-1.5">등급 분포: B 중심 → A 다수 편입</div>

            <div className="flex items-center justify-between text-[11px] bg-[#FFD700]/10 px-2 py-1 rounded border border-[#FFD700]/30">
              <div className="text-white font-medium">Gen.G</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">95.6 → 96.6</span>
                <span className="text-[#00FF00] font-semibold">(▲1.0)</span>
              </div>
            </div>
            <div className="text-[10px] text-[#8B95B5] ml-2 mb-1.5">S 등급 5장 유지</div>

            <div className="flex items-center justify-between text-[11px] bg-[#0F1629] px-2 py-1 rounded">
              <div className="text-white">Dplus KIA</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">87.4 → 88.0</span>
                <span className="text-[#00FF00] font-semibold">(▲0.6)</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] bg-[#0F1629] px-2 py-1 rounded">
              <div className="text-white">KT Rolster</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">82.0 → 82.8</span>
                <span className="text-[#00FF00] font-semibold">(▲0.8)</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] bg-[#0F1629] px-2 py-1 rounded">
              <div className="text-white">T1</div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B95B5]">91.4 → 90.2</span>
                <span className="text-[#FF4444] font-semibold">(▼1.2)</span>
              </div>
            </div>
            <div className="text-[10px] text-[#8B95B5] ml-2 mb-1.5">S 1장 유지, 상위권 구조 유지</div>

            <div className="text-[10px] text-[#8B95B5] mt-2 px-2 py-1 bg-[#0F1629] rounded">
              <span className="text-white font-medium">DN SOOPers / Nongshim / DRX / BRO</span> – 팀 성적 및 경기력 지표 반영으로 전반적 하향 또는 재배치
            </div>
          </div>
        </div>

        {/* 운영 참고 사항 */}
        <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#FFB81C]/30">
          <div className="text-xs font-semibold text-[#FFB81C] mb-2">📌 운영 참고 사항</div>
          <ul className="text-[11px] text-[#8B95B5] space-y-1 list-disc list-inside">
            <li>LCK Cup 탈락 팀은 이후 LIVE 카드 업데이트에서 경기 수 증가가 없으므로 <span className="text-white">OVR 변동이 발생하지 않음</span></li>
            <li>향후 LIVE 카드 업데이트는 <span className="text-white">경기 수 + 팀 생존 여부</span>를 함께 반영하여 진행할 예정</li>
          </ul>
        </div>

        {/* 팀별 변동 목록 */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-white mb-1">
            📊 팀별 상세 변동 (선수별 OVR 및 등급 변동)
          </div>

          {/* Gen.G */}
          <TeamChangeCard
            teamName="Gen.G"
            changes={[
              { player: "Duro", change: "S", ovr: "99", delta: "+5" },
              { player: "Ruler", change: "S", ovr: "98", delta: "+1" },
              { player: "Canyon", change: "S", ovr: "97", delta: "0" },
              { player: "Chovy", change: "S", ovr: "95", delta: "-3" },
              { player: "Kiin", change: "S", ovr: "94", delta: "-4" },
            ]}
          />

          {/* T1 */}
          <TeamChangeCard
            teamName="T1"
            changes={[
              { player: "Doran", change: "A→S", ovr: "93", delta: "+4" },
              { player: "Oner", change: "S→A", ovr: "88", delta: "-6" },
            ]}
          />

          {/* BNK FEARX */}
          <TeamChangeCard
            teamName="BNK FEARX"
            changes={[
              { player: "VicLa", change: "B→A", ovr: "91", delta: "+7" },
              { player: "Kellin", change: "B→A", ovr: "89", delta: "+8" },
              { player: "Clear", change: "B→A", ovr: "86", delta: "+6" },
              { player: "Diable", change: "B→A", ovr: "90", delta: "+5" },
            ]}
          />

          {/* KT Rolster */}
          <TeamChangeCard
            teamName="KT Rolster"
            changes={[
              { player: "Cuzz", change: "B→A", ovr: "90", delta: "+6" },
              { player: "Aiming", change: "A→B", ovr: "81", delta: "-7" },
              { player: "Ghost", change: "C→B", ovr: "80", delta: "+8" },
            ]}
          />

          {/* Dplus KIA */}
          <TeamChangeCard
            teamName="Dplus KIA"
            changes={[
              { player: "Siwoo", change: "B→A", ovr: "89", delta: "+6" },
            ]}
          />

          {/* Nongshim RedForce */}
          <TeamChangeCard
            teamName="Nongshim RedForce"
            changes={[
              { player: "Lehends", change: "A→B", ovr: "83", delta: "-4" },
              { player: "Kingen", change: "A→B", ovr: "74", delta: "-12" },
            ]}
          />

          {/* DRX */}
          <TeamChangeCard
            teamName="DRX"
            changes={[
              { player: "Willer", change: "C→B", ovr: "83", delta: "+8" },
            ]}
          />

          {/* DN SOOPers */}
          <TeamChangeCard
            teamName="DN SOOPers"
            changes={[
              { player: "Peter", change: "C→B", ovr: "80", delta: "+6" },
              { player: "Pyosik", change: "A→B", ovr: "75", delta: "-12" },
              { player: "deokdam", change: "B→C", ovr: "67", delta: "-16" },
              { player: "Life", change: "B→C", ovr: "70", delta: "-12" },
            ]}
          />

          {/* OK BRION */}
          <TeamChangeCard
            teamName="OK BRION"
            changes={[
              { player: "Namgung", change: "C→B", ovr: "76", delta: "+4" },
              { player: "Casting", change: "C→B", ovr: "74", delta: "±0" },
              { player: "GIDEON", change: "B→C", ovr: "72", delta: "-7" },
              { player: "Teddy", change: "B→C", ovr: "69", delta: "-13" },
            ]}
          />

          {/* Hanwha Life Esports (탈락팀 - 대폭 하향) */}
          <TeamChangeCard
            teamName="⚠️ Hanwha Life Esports (LCK Cup 탈락)"
            changes={[
              { player: "Zeus", change: "A→B", ovr: "75", delta: "-16" },
              { player: "Kanavi", change: "A→B", ovr: "73", delta: "-19" },
              { player: "Zeka", change: "A→B", ovr: "73", delta: "-17" },
              { player: "Gumayusi", change: "A→B", ovr: "79", delta: "-10" },
              { player: "Delight", change: "A→B", ovr: "78", delta: "-10" },
            ]}
          />
        </div>
    </div>
  );
}

// ==================== 공통 컴포넌트 ====================
interface Change {
  player: string;
  change: string;
  ovr: string;
  delta: string;
}

interface TeamChangeCardProps {
  teamName: string;
  changes: Change[];
}

function TeamChangeCard({ teamName, changes }: TeamChangeCardProps) {
  return (
    <div className="bg-[#1A2347]/50 rounded-lg p-2.5 border border-[#2A3A67]/50">
      <div className="text-xs font-semibold text-white mb-1.5">{teamName}</div>
      <div className="space-y-0.5">
        {changes.map((change, idx) => {
          const isDeltaPositive = change.delta.startsWith("+");
          const isDeltaNegative = change.delta.startsWith("-");
          const deltaColor = isDeltaPositive 
            ? "text-[#00FF00]" 
            : isDeltaNegative 
            ? "text-[#FF4444]" 
            : "text-[#8B95B5]";

          return (
            <div
              key={idx}
              className="flex items-center justify-between text-[11px] bg-[#0F1629] px-2 py-1 rounded"
            >
              <div className="flex items-center gap-2">
                <span className="text-white font-medium min-w-[70px]">
                  {change.player}
                </span>
                <span className="text-[#8B95B5] min-w-[45px]">
                  {change.change}
                </span>
                <span className="text-[#8B95B5]">
                  {change.ovr}
                </span>
              </div>
              <span className={`font-semibold ${deltaColor}`}>
                {change.delta}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
