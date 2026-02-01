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
            <li>Hanwha Life Esports LCK Cup 탈락 결과 반영해 팀 전반 하향 조정</li>
            <li>최신 경기력 지표 반영을 위해 전 카드 OVR 재정규화 적용</li>
            <li>전체 55장 기준 <span className="text-white">S 6장 / A 16장 / B 25장 / C 8장</span>으로 재조정</li>
            <li className="text-[#FFB81C]">LCK Cup 탈락팀은 이후 OVR 변동 최소화(고정) 예정</li>
          </ul>
        </div>

        {/* S 등급 정원 */}
        <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#FFD700]/20">
          <div className="text-xs font-semibold text-white mb-2">👑 S 등급 목록 (6장 고정)</div>
          <div className="space-y-1.5">
            <div>
              <div className="text-[10px] text-[#FFD700] mb-1">Gen.G (5장)</div>
              <div className="flex flex-wrap gap-1">
                <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded text-[11px] font-medium border border-[#FFD700]/30">Duro 99</span>
                <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded text-[11px] font-medium border border-[#FFD700]/30">Ruler 98</span>
                <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded text-[11px] font-medium border border-[#FFD700]/30">Canyon 97</span>
                <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded text-[11px] font-medium border border-[#FFD700]/30">Chovy 95</span>
                <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded text-[11px] font-medium border border-[#FFD700]/30">Kiin 94</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#FFD700] mb-1">T1 (1장)</div>
              <div className="flex flex-wrap gap-1">
                <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded text-[11px] font-medium border border-[#FFD700]/30">Doran 93</span>
              </div>
            </div>
          </div>
        </div>

        {/* 등급 변동자 */}
        <div className="bg-[#1A2347]/50 rounded-lg p-3 border border-[#2A3A67]/50">
          <div className="text-xs font-semibold text-white mb-2">⚡ 등급 변동자 (26명)</div>
          <div className="text-[10px] text-[#8B95B5] mb-2">A→B 9명 / B→A 6명 / C→B 5명 / B→C 4명 / S→A 1명 / A→S 1명</div>
          <div className="space-y-2">
            {/* A→S */}
            <div>
              <div className="text-[10px] text-[#FFD700] font-semibold mb-1">✨ A→S (1명)</div>
              <div className="space-y-0.5 text-[11px] text-[#8B95B5]">
                <div><span className="text-white">Doran</span> A 89 → S 93 <span className="text-[#00FF00]">(+4)</span></div>
              </div>
            </div>

            {/* S→A */}
            <div>
              <div className="text-[10px] text-[#FF8844] font-semibold mb-1">⚠️ S→A (1명)</div>
              <div className="space-y-0.5 text-[11px] text-[#8B95B5]">
                <div><span className="text-white">Oner</span> S 94 → A 88 <span className="text-[#FF4444]">(-6)</span></div>
              </div>
            </div>

            {/* B→A */}
            <div>
              <div className="text-[10px] text-[#00FF00] font-semibold mb-1">▲ B→A (6명)</div>
              <div className="space-y-0.5 text-[11px] text-[#8B95B5]">
                <div><span className="text-white">Kellin</span> B 81 → A 89 <span className="text-[#00FF00]">(+8)</span></div>
                <div><span className="text-white">VicLa</span> B 84 → A 91 <span className="text-[#00FF00]">(+7)</span></div>
                <div><span className="text-white">Clear</span> B 80 → A 86 <span className="text-[#00FF00]">(+6)</span></div>
                <div><span className="text-white">Cuzz</span> B 84 → A 90 <span className="text-[#00FF00]">(+6)</span></div>
                <div><span className="text-white">Siwoo</span> B 83 → A 89 <span className="text-[#00FF00]">(+6)</span></div>
                <div><span className="text-white">Diable</span> B 85 → A 90 <span className="text-[#00FF00]">(+5)</span></div>
              </div>
            </div>

            {/* C→B */}
            <div>
              <div className="text-[10px] text-[#88FF88] font-semibold mb-1">↗ C→B (5명)</div>
              <div className="space-y-0.5 text-[11px] text-[#8B95B5]">
                <div><span className="text-white">Ghost</span> C 72 → B 80 <span className="text-[#00FF00]">(+8)</span></div>
                <div><span className="text-white">Willer</span> C 75 → B 83 <span className="text-[#00FF00]">(+8)</span></div>
                <div><span className="text-white">Peter</span> C 74 → B 80 <span className="text-[#00FF00]">(+6)</span></div>
                <div><span className="text-white">Namgung</span> C 72 → B 76 <span className="text-[#00FF00]">(+4)</span></div>
                <div><span className="text-white">Casting</span> C 74 → B 74 <span className="text-[#8B95B5]">(±0)</span></div>
              </div>
            </div>

            {/* A→B */}
            <div>
              <div className="text-[10px] text-[#FF4444] font-semibold mb-1">▼ A→B (9명)</div>
              <div className="space-y-0.5 text-[11px] text-[#8B95B5]">
                <div><span className="text-white">Lehends</span> A 87 → B 83 <span className="text-[#FF4444]">(-4)</span></div>
                <div><span className="text-white">Aiming</span> A 88 → B 81 <span className="text-[#FF4444]">(-7)</span></div>
                <div><span className="text-white">Gumayusi</span> A 89 → B 79 <span className="text-[#FF4444]">(-10)</span></div>
                <div><span className="text-white">Delight</span> A 88 → B 78 <span className="text-[#FF4444]">(-10)</span></div>
                <div><span className="text-white">Kingen</span> A 86 → B 74 <span className="text-[#FF4444]">(-12)</span></div>
                <div><span className="text-white">Pyosik</span> A 87 → B 75 <span className="text-[#FF4444]">(-12)</span></div>
                <div><span className="text-white">Zeus</span> A 91 → B 75 <span className="text-[#FF4444]">(-16)</span></div>
                <div><span className="text-white">Zeka</span> A 90 → B 73 <span className="text-[#FF4444]">(-17)</span></div>
                <div><span className="text-white">Kanavi</span> A 92 → B 73 <span className="text-[#FF4444]">(-19)</span></div>
              </div>
            </div>

            {/* B→C */}
            <div>
              <div className="text-[10px] text-[#FF6666] font-semibold mb-1">↘ B→C (4명)</div>
              <div className="space-y-0.5 text-[11px] text-[#8B95B5]">
                <div><span className="text-white">GIDEON</span> B 79 → C 72 <span className="text-[#FF4444]">(-7)</span></div>
                <div><span className="text-white">Life</span> B 82 → C 70 <span className="text-[#FF4444]">(-12)</span></div>
                <div><span className="text-white">Teddy</span> B 82 → C 69 <span className="text-[#FF4444]">(-13)</span></div>
                <div><span className="text-white">deokdam</span> B 83 → C 67 <span className="text-[#FF4444]">(-16)</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* 팀별 변동 목록 */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-white mb-1">
            📊 팀별 상세 변동 (55명 기준)
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
