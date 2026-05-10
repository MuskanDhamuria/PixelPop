import { apiGet, apiPost } from '../utils/api';
import flappyFrostImage from '../../assets/flappyfrost.png';
import globeDashImage from '../../assets/globedash.png';
import guessTopiaImage from '../../assets/guesstopia.png';
import neonStrikeImage from '../../assets/neonstrike.png';

export const badgeColors = {
  Educational: "bg-blue-500/20 text-blue-300 border-blue-400/30",
  Action: "bg-red-500/20 text-red-300 border-red-400/30",
  Arcade: "bg-purple-500/20 text-purple-300 border-purple-400/30",
  Strategy: "bg-green-500/20 text-green-300 border-green-400/30",
  Puzzle: "bg-yellow-500/20 text-yellow-300 border-yellow-400/30",
};

export interface GameReview {
  id: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  helpful: number;
  notHelpful: number;
  timestamp: string;
}

export interface Game {
  id: number;
  name: string;
  image: string;
  link: string;
  badge: keyof typeof badgeColors;
  badgeColor: string;
  code: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  playerCount: '1' | '2' | '2-4' | '4+';
  duration: '5min' | '10min' | '15min' | '30min+';
  description: string;
  rating: number;
  reviewCount: number;
  reviews: GameReview[];
}

const gameImages: Record<number, string> = {
  1: globeDashImage,
  2: guessTopiaImage,
  3: neonStrikeImage,
  4: flappyFrostImage,
};

const gameImageByName: Record<string, string> = {
  globedash: globeDashImage,
  guesstopia: guessTopiaImage,
  neonstrike: neonStrikeImage,
  'flappy frost': flappyFrostImage,
};

export const games: Game[] = [
  {
    id: 1,
    name: "GlobeDash",
    image: globeDashImage,
    link: "https://muskandhamuria.github.io/GlobeDash/",
    badge: "Educational",
    badgeColor: badgeColors["Educational"],
    code: "https://github.com/MuskanDhamuria/GlobeDash",
    difficulty: 'Medium',
    playerCount: '1',
    duration: '15min',
    description: 'Race around the world while learning geography!',
    rating: 4.5,
    reviewCount: 234,
    reviews: []
  },
  {
    id: 2,
    name: "GuessTopia",
    image: guessTopiaImage,
    link: "https://muskandhamuria.github.io/GuessTopia/",
    badge: "Educational",
    badgeColor: badgeColors["Educational"],
    code: "https://github.com/MuskanDhamuria/GuessTopia",
    difficulty: 'Easy',
    playerCount: '1',
    duration: '10min',
    description: 'Test your knowledge across various topics!',
    rating: 4.3,
    reviewCount: 189,
    reviews: []
  },
  {
    id: 3,
    name: "NeonStrike",
    image: neonStrikeImage,
    link: "https://muskandhamuria.github.io/NeonStrike/",
    badge: "Action",
    badgeColor: badgeColors["Action"],
    code: "https://github.com/MuskanDhamuria/NeonStrike",
    difficulty: 'Hard',
    playerCount: '1',
    duration: '5min',
    description: 'Fast-paced action requiring quick reflexes!',
    rating: 4.7,
    reviewCount: 512,
    reviews: []
  },
  {
    id: 4,
    name: "Flappy Frost",
    image: flappyFrostImage,
    link: "https://muskandhamuria.github.io/FlappyFrost/",
    badge: "Arcade",
    badgeColor: badgeColors["Arcade"],
    code: "https://github.com/MuskanDhamuria/FlappyFrost",
    difficulty: 'Easy',
    playerCount: '1',
    duration: '5min',
    description: 'Classic arcade gameplay with a winter twist!',
    rating: 4.6,
    reviewCount: 387,
    reviews: []
  }
];

export const getBadgeColor = (badge: keyof typeof badgeColors | string) =>
  badgeColors[badge as keyof typeof badgeColors] ?? "bg-white/10 text-white/70 border-white/20";

const normalizeGame = (game: Game): Game => ({
  ...game,
  image: gameImages[game.id] ?? gameImageByName[game.name.toLowerCase()] ?? game.image,
  badgeColor: game.badgeColor ?? getBadgeColor(game.badge),
  rating: Number(game.rating ?? 0),
  reviewCount: Number(game.reviewCount ?? game.reviews?.length ?? 0),
  reviews: game.reviews ?? [],
});

export const fetchGames = async (): Promise<Game[]> => {
  try {
    const backendGames = await apiGet<Game[]>('/games');
    if (backendGames.length > 0) {
      return backendGames.map(normalizeGame);
    }

    const seededGames = await apiPost<Game[]>('/games/seed', { games });
    return seededGames.map(normalizeGame);
  } catch (error) {
    console.error('Failed to load games from backend, using local seed:', error);
    return games.map(normalizeGame);
  }
};

export const submitGameReview = (
  gameId: number,
  rating: number,
  comment: string,
  accessToken: string
) => apiPost<Game>(`/games/${gameId}/reviews`, { rating, comment }, accessToken);
