export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  bio: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  gamesPlayed: number;
  totalPlayTime: number;
  favoriteGenre: string;
  joinDate: Date;
  lastLogin: Date;
  achievements: string[];
  favorites: number[];
  recentlyPlayed: RecentGame[];
  streak: number;
  lastPlayDate: string;
  friends: string[];
  friendRequests: string[];
}

export interface RecentGame {
  gameId: number;
  gameName: string;
  playedAt: Date;
  duration: number;
}

export interface Friend {
  id: string;
  username: string;
  avatar?: string;
  level: number;
  status: 'online' | 'offline' | 'playing';
  currentGame?: string;
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  type: 'achievement' | 'high_score' | 'new_game' | 'friend_added';
  description: string;
  timestamp: Date;
  gameId?: number;
  gameName?: string;
}

export const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 1000) + 1;
};

export const xpForNextLevel = (level: number): number => {
  return level * 1000;
};

export const xpProgress = (xp: number, level: number): number => {
  const currentLevelXP = (level - 1) * 1000;
  const xpInLevel = xp - currentLevelXP;
  const xpNeeded = 1000;
  return (xpInLevel / xpNeeded) * 100;
};
