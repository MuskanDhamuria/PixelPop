import { apiGet } from '../utils/api';

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  requirement: number;
  type: 'play_games' | 'win_games' | 'add_friend' | 'write_review';
  icon: string;
}

export const fetchDailyChallenges = () => apiGet<DailyChallenge[]>('/daily-challenges');
