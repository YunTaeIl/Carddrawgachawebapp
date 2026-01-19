// Supabase API 호출
import { LCKCard } from "@/types/lck";
import { projectId, publicAnonKey } from "@/utils/supabase/info";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ffd115c0`;

// 서버 응답 타입
interface ServerCard {
  id: string;
  year: number;
  team: string;
  name: string;
  position: "TOP" | "JGL" | "MID" | "ADC" | "SUP";
  grade: "S" | "A" | "B" | "C";
  image?: string;
  stats: {
    ovr: number;
    mechanics: number;
    laning: number;
    teamfight: number;
    macro: number;
    clutch: number;
  };
}

// 서버 카드 → 클라이언트 카드 변환
function convertServerCard(serverCard: ServerCard): LCKCard {
  return {
    id: serverCard.id,
    year: serverCard.year,
    team: serverCard.team,
    name: serverCard.name,
    grade: serverCard.grade,
    position: serverCard.position,
    image: serverCard.image || "",
    stats: serverCard.stats
  };
}

// 모든 카드 가져오기
export async function fetchAllCards(): Promise<LCKCard[]> {
  try {
    const response = await fetch(`${API_URL}/cards`, {
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cards: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to fetch cards");
    }

    return data.cards.map(convertServerCard);
  } catch (error) {
    throw error;
  }
}

// 특정 카드 가져오기
export async function fetchCardById(id: string): Promise<LCKCard | null> {
  try {
    const response = await fetch(`${API_URL}/cards/${id}`, {
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch card: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to fetch card");
    }

    return convertServerCard(data.card);
  } catch (error) {
    console.error(`Error fetching card ${id} from Supabase:`, error);
    throw error;
  }
}