import React from "react";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";

interface PatchNotesProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PatchNotes({ isOpen, onClose }: PatchNotesProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[#0F1629] border border-[#2A3A67] p-0">
      <DialogTitle className="sr-only">LIVE 카드 밸런스 패치노트</DialogTitle>
      <DialogDescription className="sr-only">2026-02-02 LCK Cup 2026 기준, Hanwha Life Esports 탈락 반영 및 전 카드 재정규화</DialogDescription>
      
      {/* 헤더 */}
      <div className="sticky top-0 bg-[#1A2347] border-b border-[#2A3A67] px-5 py-3 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              📋 LIVE 카드 밸런스 패치노트
            </h1>
            <p className="text-xs text-[#8B95B5] mt-0.5">
              2026-02-02 • LCK Cup 2026 기준
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
      
      <div className="p-5 space-y-4">
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
              { player: "Gumayusi", change: "A→B", ovr: "79", delta: "-10" },
            ]}
          />

          {/* Dplus KIA */}
          <TeamChangeCard
            teamName="Dplus KIA"
            changes={[
              { player: "Kellin", change: "B→A", ovr: "89", delta: "+8" },
              { player: "Ghost", change: "C→B", ovr: "80", delta: "+8" },
              { player: "Willer", change: "C→B", ovr: "83", delta: "+8" },
            ]}
          />

          {/* KT Rolster */}
          <TeamChangeCard
            teamName="KT Rolster"
            changes={[
              { player: "VicLa", change: "B→A", ovr: "91", delta: "+7" },
              { player: "Lehends", change: "A→B", ovr: "83", delta: "-4" },
              { player: "Aiming", change: "A→B", ovr: "81", delta: "-7" },
            ]}
          />

          {/* BNK FearX */}
          <TeamChangeCard
            teamName="BNK FearX"
            changes={[
              { player: "Clear", change: "B→A", ovr: "86", delta: "+6" },
              { player: "Peter", change: "C→B", ovr: "80", delta: "+6" },
              { player: "Diable", change: "B→A", ovr: "90", delta: "+5" },
            ]}
          />

          {/* OK BRION */}
          <TeamChangeCard
            teamName="OK BRION"
            changes={[
              { player: "Cuzz", change: "B→A", ovr: "90", delta: "+6" },
              { player: "Siwoo", change: "B→A", ovr: "89", delta: "+6" },
              { player: "Namgung", change: "C→B", ovr: "76", delta: "+4" },
            ]}
          />

          {/* DRX */}
          <TeamChangeCard
            teamName="DRX"
            changes={[
              { player: "Casting", change: "C→B", ovr: "74", delta: "±0" },
              { player: "GIDEON", change: "B→C", ovr: "72", delta: "-7" },
              { player: "Life", change: "B→C", ovr: "70", delta: "-12" },
              { player: "Teddy", change: "B→C", ovr: "69", delta: "-13" },
            ]}
          />

          {/* DN SOOPers */}
          <TeamChangeCard
            teamName="DN SOOPers"
            changes={[
              { player: "Pyosik", change: "A→B", ovr: "75", delta: "-12" },
              { player: "deokdam", change: "B→C", ovr: "67", delta: "-16" },
            ]}
          />

          {/* Hanwha Life Esports (탈락팀 - 대폭 하향) */}
          <TeamChangeCard
            teamName="⚠️ Hanwha Life Esports (LCK Cup 탈락)"
            changes={[
              { player: "Delight", change: "A→B", ovr: "78", delta: "-10" },
              { player: "Kingen", change: "A→B", ovr: "74", delta: "-12" },
              { player: "Zeus", change: "A→B", ovr: "75", delta: "-16" },
              { player: "Zeka", change: "A→B", ovr: "73", delta: "-17" },
              { player: "Kanavi", change: "A→B", ovr: "73", delta: "-19" },
            ]}
          />
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
}

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
