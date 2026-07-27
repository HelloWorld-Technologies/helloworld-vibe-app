export const VIBE_OPTIONS = [
  { id: 'chill', label: 'Chill', emoji: '😌' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
] as const;

export type VibeOption = (typeof VIBE_OPTIONS)[number];
export type VibeId = VibeOption['id'];

/** Move-in onboarding — pick up to 5 interests (Figma). */
export const MOVE_IN_INTEREST_OPTIONS = [
  { id: 'chill', label: 'Chill', emoji: '😎' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
  { id: 'fitness', label: 'Fitness', emoji: '🏋️' },
  { id: 'gamer', label: 'Gamer', emoji: '🎮' },
  { id: 'football', label: 'Football', emoji: '⚽' },
  { id: 'hustle', label: 'Hustle', emoji: '🚀' },
  { id: 'foodie', label: 'Foodie', emoji: '🍔' },
  { id: 'night-owl', label: 'Night Owl', emoji: '🦉' },
  { id: 'party', label: 'Party', emoji: '🎉' },
  { id: 'coders', label: 'Coders', emoji: '👩‍💻' },
  { id: 'cricket', label: 'Cricket', emoji: '🏏' },
  { id: 'biryani', label: 'Biryani Lovers', emoji: '🍲' },
  { id: 'explorer', label: 'Explorer', emoji: '✈️' },
  { id: 'movie-buff', label: 'Movie Buff', emoji: '🎬' },
  { id: 'cooking', label: 'Cooking', emoji: '🍳' },
  { id: 'swimming', label: 'Swimming', emoji: '🏊' },
  { id: 'pet-lover', label: 'Pet Lover', emoji: '🐱' },
  { id: 'reader', label: 'Reader', emoji: '📚' },
] as const;

export const MOVE_IN_INTERESTS_MAX = 5;

export type MoveInInterestOption = (typeof MOVE_IN_INTEREST_OPTIONS)[number];

/** Resident interests commonly found at a property (HDP vibe match card). */
export const PROPERTY_VIBE_OPTIONS = [
  { id: 'coder', label: 'Coder', emoji: '💻' },
  { id: 'gamer', label: 'Gamer', emoji: '🎮' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'fitness-freak', label: 'Fitness Freak', emoji: '🏋️' },
  { id: 'cricket', label: 'Cricket', emoji: '🏏' },
  { id: 'football', label: 'Football', emoji: '⚽' },
  { id: 'badminton', label: 'Badminton', emoji: '🏸' },
  { id: 'runner', label: 'Runner', emoji: '🏃' },
  { id: 'board-games', label: 'Board Games', emoji: '🎲' },
  { id: 'creator', label: 'Creator', emoji: '📸' },
  { id: 'bookworm', label: 'Bookworm', emoji: '📚' },
] as const;

export type PropertyVibeOption = (typeof PROPERTY_VIBE_OPTIONS)[number];

/** Teal → purple gradient used on selected vibe chip borders. */
export const VIBE_CHIP_GRADIENT = ['#38BFF8', '#6941C6'] as const;

/** Emoji fallbacks for API vibe `code` values (GET /vibes/list). */
export const VIBE_CODE_EMOJI: Record<string, string> = {
  foodie: '🍔',
  sports: '⚽',
  coder: '👩‍💻',
  coders: '👩‍💻',
  fitness: '🏋️',
  'board-games': '🎲',
  board_games: '🎲',
  boardgames: '🎲',
  movies: '🎬',
  music: '🎵',
  travel: '✈️',
  networking: '🤝',
  reading: '📚',
  reader: '📚',
  chill: '😎',
  creative: '🎨',
  gaming: '🎮',
  gamer: '🎮',
};

export function emojiForVibeCode(code: string, fallback = '✨') {
  const normalized = code.trim().toLowerCase().replace(/\s+/g, '-');
  return (
    VIBE_CODE_EMOJI[normalized] ??
    VIBE_CODE_EMOJI[normalized.replace(/-/g, '_')] ??
    VIBE_CODE_EMOJI[normalized.replace(/_/g, '')] ??
    fallback
  );
}
