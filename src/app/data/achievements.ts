import { apiGet, apiPost } from '../utils/api';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: number;
  category: 'games' | 'social' | 'skill' | 'streak';
}

export const achievements: Achievement[] = [
  {
    id: 'first_game',
    name: 'First Game',
    description: 'Play your first game',
    icon: 'PLAY',
    rarity: 'common',
    requirement: 1,
    category: 'games',
  },
  {
    id: 'games_10',
    name: 'Game Explorer',
    description: 'Play 10 games',
    icon: '10X',
    rarity: 'rare',
    requirement: 10,
    category: 'games',
  },
  {
    id: 'games_50',
    name: 'Arcade Regular',
    description: 'Play 50 games',
    icon: '50X',
    rarity: 'epic',
    requirement: 50,
    category: 'games',
  },
  {
    id: 'games_100',
    name: 'Century Player',
    description: 'Play 100 games',
    icon: '100',
    rarity: 'epic',
    requirement: 100,
    category: 'games',
  },
  {
    id: 'games_1000',
    name: 'Thousand Run Club',
    description: 'Play 1,000 games',
    icon: '1K',
    rarity: 'legendary',
    requirement: 1000,
    category: 'games',
  },
  {
    id: 'games_1000000',
    name: 'Million Game Myth',
    description: 'Play 1,000,000 games',
    icon: '1M',
    rarity: 'legendary',
    requirement: 1000000,
    category: 'games',
  },
  {
    id: 'games_100000000000',
    name: 'Cosmic Completionist',
    description: 'Play 100,000,000,000 games',
    icon: '∞',
    rarity: 'legendary',
    requirement: 100000000000,
    category: 'games',
  },
  {
    id: 'first_friend',
    name: 'First Friend',
    description: 'Add your first friend',
    icon: 'PAL',
    rarity: 'common',
    requirement: 1,
    category: 'social',
  },
  {
    id: 'friends_10',
    name: 'Friendly Circle',
    description: 'Add 10 friends',
    icon: '10F',
    rarity: 'rare',
    requirement: 10,
    category: 'social',
  },
  {
    id: 'friends_50',
    name: 'Social Galaxy',
    description: 'Add 50 friends',
    icon: '50F',
    rarity: 'epic',
    requirement: 50,
    category: 'social',
  },
];

export const fetchAchievements = async () => {
  const backendAchievements = await apiGet<Achievement[]>('/achievements');
  const missingAchievement = achievements.some(
    (achievement) => !backendAchievements.some((backendAchievement) => backendAchievement.id === achievement.id)
  );

  if (!missingAchievement) {
    return backendAchievements;
  }

  return apiPost<Achievement[]>('/achievements/seed', { achievements });
};

export const getRarityColor = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common':
      return 'from-gray-500 to-gray-600';
    case 'rare':
      return 'from-blue-500 to-cyan-500';
    case 'epic':
      return 'from-purple-500 to-pink-500';
    case 'legendary':
      return 'from-yellow-400 to-orange-500';
  }
};
