/** Display order for “A Day from here” cards — aligned with helloworld-vibe web. */
export const nearbyCategoryFlow = [
  {
    id: 'workout',
    apiKeys: ['lifestyle_fitness', 'gym', 'fitness'],
    emoji: '💪',
    category: 'Workout',
    linkLabel: 'View Gyms Nearby',
  },
  {
    id: 'commute',
    apiKeys: ['transport', 'transit'],
    emoji: '🚇',
    category: 'Commute',
    linkLabel: 'View Transit Nearby',
  },
  {
    id: 'work',
    apiKeys: ['work_education', 'work', 'office', 'education'],
    emoji: '🏢',
    category: 'Work',
    linkLabel: 'View Offices Nearby',
  },
  {
    id: 'lunch',
    apiKeys: ['food_dining', 'food', 'dining', 'restaurant'],
    emoji: '🍔',
    category: 'Lunch',
    linkLabel: 'View Dining Nearby',
  },
  {
    id: 'shopping',
    apiKeys: ['daily_essentials', 'store'],
    emoji: '🛒',
    category: 'Shopping',
    linkLabel: 'View Markets Nearby',
  },
  {
    id: 'entertainment',
    apiKeys: ['entertainment_shopping', 'entertainment'],
    emoji: '🍿',
    category: 'Entertainment',
    linkLabel: 'View Entertainment Nearby',
  },
  {
    id: 'night-life',
    apiKeys: ['night_life', 'nightlife', 'night-life'],
    emoji: '🌙',
    category: 'Night Life',
    linkLabel: 'View Nightlife Nearby',
  },
  {
    id: 'healthcare',
    apiKeys: ['healthcare', 'hospital', 'health'],
    emoji: '🏥',
    category: 'Healthcare',
    linkLabel: 'View Healthcare Nearby',
  },
] as const;
