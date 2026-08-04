export const VIBE_OPTIONS = [
  { id: 'chill', label: 'Chill', emoji: '😌' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
] as const;

export type VibeOption = (typeof VIBE_OPTIONS)[number];
export type VibeId = VibeOption['id'];

/** Move-in onboarding — select at least 5 interests (legacy vibes popup). */
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

export const MOVE_IN_INTERESTS_MIN = 5;
export const MOVE_IN_INTERESTS_MAX = 10;

export type MoveInInterestOption = (typeof MOVE_IN_INTEREST_OPTIONS)[number];

/**
 * Mirrors production GET /vibes/list.
 * Used when staging (or any env) returns an empty list.
 */
export const FALLBACK_API_VIBES = [
  { id: 1, code: 'night_owl', display_name: 'Night Owl' },
  { id: 2, code: 'foodie', display_name: 'Foodie' },
  { id: 3, code: 'traveller', display_name: 'Traveller' },
  { id: 4, code: 'party', display_name: 'Party' },
  { id: 5, code: 'entrepreneur', display_name: 'Entrepreneur' },
  { id: 6, code: 'coder', display_name: 'Coder' },
  { id: 7, code: 'gamer', display_name: 'Gamer' },
  { id: 8, code: 'music', display_name: 'Music' },
  { id: 9, code: 'fitness_freak', display_name: 'Fitness Freak' },
  { id: 10, code: 'cricket', display_name: 'Cricket' },
  { id: 11, code: 'football', display_name: 'Football' },
  { id: 12, code: 'badminton', display_name: 'Badminton' },
  { id: 13, code: 'runner', display_name: 'Runner' },
  { id: 14, code: 'board_games', display_name: 'Board Games' },
  { id: 15, code: 'card_games', display_name: 'Card Games' },
  { id: 16, code: 'content_creator', display_name: 'Content Creator' },
  { id: 17, code: 'book_lover', display_name: 'Book Lover' },
  { id: 18, code: 'movie_lover', display_name: 'Movie Lover' },
] as const;

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
  'fitness-freak': '🏋️',
  fitness_freak: '🏋️',
  'board-games': '🎲',
  board_games: '🎲',
  boardgames: '🎲',
  'card-games': '🃏',
  card_games: '🃏',
  movies: '🎬',
  'movie-lover': '🎬',
  movie_lover: '🎬',
  music: '🎵',
  travel: '✈️',
  traveller: '✈️',
  traveler: '✈️',
  networking: '🤝',
  reading: '📚',
  reader: '📚',
  'book-lover': '📚',
  book_lover: '📚',
  chill: '😎',
  creative: '🎨',
  gaming: '🎮',
  gamer: '🎮',
  'night-owl': '🦉',
  night_owl: '🦉',
  party: '🎉',
  entrepreneur: '🚀',
  cricket: '🏏',
  football: '⚽',
  badminton: '🏸',
  runner: '🏃',
  'content-creator': '📸',
  content_creator: '📸',
};

export function emojiForVibeCode(code: string, fallback = '✨') {
  const normalized = code.trim().toLowerCase().replace(/\s+/g, '-');
  const underscored = normalized.replace(/-/g, '_');
  const dashed = normalized.replace(/_/g, '-');
  return (
    VIBE_CODE_EMOJI[normalized] ??
    VIBE_CODE_EMOJI[underscored] ??
    VIBE_CODE_EMOJI[dashed] ??
    VIBE_CODE_EMOJI[normalized.replace(/_/g, '')] ??
    fallback
  );
}

/** Map GET /vibes/list rows into chip list items. */
export function mapVibesToListItems(
  vibes: readonly { id: number; code: string; display_name: string }[],
) {
  return vibes.map((vibe) => ({
    id: String(vibe.id),
    label: vibe.display_name,
    emoji: emojiForVibeCode(vibe.code),
  }));
}
