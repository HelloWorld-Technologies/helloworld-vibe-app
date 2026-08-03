import palette from "@/constants/palette";

/** Dashboard header — Figma: #252B37 → #3B4760 at ~76° */
export const DASHBOARD_HEADER_GRADIENT = {
  colors: [palette.gray[800], palette.homeGradientBottom] as const,
  start: { x: 0, y: 0 } as const,
  end: { x: 1, y: 1 } as const,
};

export const DASHBOARD_RENT_CARD_GRADIENT = {
  colors: [palette.yellow[50], palette.yellow[25], palette.white] as const,
  start: { x: 0, y: 0 } as const,
  end: { x: 1, y: 1 } as const,
};

/** Figma move-in pending card — soft yellow glow bottom-right */
export const DASHBOARD_MOVE_IN_CARD_GRADIENT = {
  colors: ["#FEDB8A", palette.white, palette.white] as const,
  start: { x: 1, y: 1 } as const,
  end: { x: 0, y: 0 } as const,
};

export const DASHBOARD_REFERRAL_GRADIENT = {
  colors: [palette.white, palette.blue[100]] as const,
  start: { x: 0, y: 0 } as const,
  end: { x: 1, y: 1 } as const,
};

export const DASHBOARD_SOS_GRADIENT = {
  colors: [palette.red[50], palette.red[100]] as const,
  start: { x: 0, y: 0 } as const,
  end: { x: 1, y: 1 } as const,
};

export const DASHBOARD_SHEET_RADIUS = 32;
export const DASHBOARD_SHEET_OVERLAP = 28;
export const DASHBOARD_SECTION_GAP = 32;
