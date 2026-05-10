import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { UserProfile, calculateLevel, xpForNextLevel } from '../types/user';
import { auth } from '../utils/auth';

interface UserContextType {
  userProfile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  addFavorite: (gameId: number) => Promise<void>;
  removeFavorite: (gameId: number) => Promise<void>;
  addRecentlyPlayed: (gameId: number, gameName: string) => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  updateStreak: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const userProfileRef = useRef<UserProfile | null>(null);

  const normalizeProfile = (profile: UserProfile): UserProfile => ({
    ...profile,
    joinDate: new Date(profile.joinDate),
    lastLogin: new Date(profile.lastLogin),
    recentlyPlayed: (profile.recentlyPlayed ?? []).map((recent) => ({
      ...recent,
      playedAt: new Date(recent.playedAt),
    })),
    achievements: profile.achievements ?? [],
    favorites: profile.favorites ?? [],
    friends: profile.friends ?? [],
    friendRequests: profile.friendRequests ?? [],
  });

  useEffect(() => {
    // Load user profile from the backend.
    const loadProfile = async () => {
      const session = await auth.getSession();
      if (session?.user) {
        const accessToken = session.access_token;
        const profile = await auth.getProfile(accessToken);
        if (profile) {
          const normalizedProfile = normalizeProfile(profile as UserProfile);
          userProfileRef.current = normalizedProfile;
          setUserProfile(normalizedProfile);
        }
      }
    };

    loadProfile();
  }, []);

  const saveProfile = async (profile: UserProfile) => {
    userProfileRef.current = profile;
    setUserProfile(profile);
    await auth.updateProfile(profile);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const currentProfile = userProfileRef.current;
    if (currentProfile) {
      await saveProfile({ ...currentProfile, ...updates });
    }
  };

  const addXP = async (amount: number) => {
    const currentProfile = userProfileRef.current;
    if (currentProfile) {
      const newXP = currentProfile.xp + amount;
      const newLevel = calculateLevel(newXP);
      const leveledUp = newLevel > currentProfile.level;

      await saveProfile({
        ...currentProfile,
        xp: newXP,
        level: newLevel,
        xpToNextLevel: xpForNextLevel(newLevel)
      });

      if (leveledUp) {
        // You could trigger a level-up animation here
        console.log(`Level up! Now level ${newLevel}`);
      }
    }
  };

  const addFavorite = async (gameId: number) => {
    const currentProfile = userProfileRef.current;
    if (currentProfile && !currentProfile.favorites.includes(gameId)) {
      await saveProfile({
        ...currentProfile,
        favorites: [...currentProfile.favorites, gameId]
      });
    }
  };

  const removeFavorite = async (gameId: number) => {
    const currentProfile = userProfileRef.current;
    if (currentProfile) {
      await saveProfile({
        ...currentProfile,
        favorites: currentProfile.favorites.filter(id => id !== gameId)
      });
    }
  };

  const addRecentlyPlayed = async (gameId: number, gameName: string) => {
    const backendProfile = await auth.recordGamePlay(gameId, gameName);
    if (backendProfile) {
      const normalizedProfile = normalizeProfile(backendProfile);
      userProfileRef.current = normalizedProfile;
      setUserProfile(normalizedProfile);
      return;
    }

    const currentProfile = userProfileRef.current;
    if (currentProfile) {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newRecent = {
        gameId,
        gameName,
        playedAt: new Date(),
        duration: 5 // minutes, could be actual playtime
      };

      const nextGamesPlayed = currentProfile.gamesPlayed + 1;
      const updatedRecent = [newRecent, ...currentProfile.recentlyPlayed.filter(g => g.gameId !== gameId)].slice(0, 10);
      let newXP = currentProfile.xp + 50;
      let newStreak = currentProfile.streak;
      let lastPlayDate = currentProfile.lastPlayDate;
      const achievements = [...currentProfile.achievements];

      const awardAchievement = (achievementId: string) => {
        if (!achievements.includes(achievementId)) {
          achievements.push(achievementId);
          newXP += 100;
        }
      };

      if (currentProfile.lastPlayDate !== today) {
        newStreak = currentProfile.lastPlayDate === yesterday ? currentProfile.streak + 1 : 1;
        lastPlayDate = today;
      }

      if (nextGamesPlayed >= 1) awardAchievement('first_game');
      if (nextGamesPlayed >= 10) awardAchievement('games_10');
      if (nextGamesPlayed >= 50) awardAchievement('games_50');
      if (nextGamesPlayed >= 100) awardAchievement('games_100');
      if (nextGamesPlayed >= 1000) awardAchievement('games_1000');
      if (nextGamesPlayed >= 1000000) awardAchievement('games_1000000');
      if (nextGamesPlayed >= 100000000000) awardAchievement('games_100000000000');

      const newLevel = calculateLevel(newXP);

      await saveProfile({
        ...currentProfile,
        recentlyPlayed: updatedRecent,
        gamesPlayed: nextGamesPlayed,
        xp: newXP,
        level: newLevel,
        xpToNextLevel: xpForNextLevel(newLevel),
        streak: newStreak,
        lastPlayDate,
        achievements
      });
    }
  };

  const unlockAchievement = async (achievementId: string) => {
    const currentProfile = userProfileRef.current;
    if (currentProfile && !currentProfile.achievements.includes(achievementId)) {
      const newXP = currentProfile.xp + 100;
      const newLevel = calculateLevel(newXP);
      await saveProfile({
        ...currentProfile,
        achievements: [...currentProfile.achievements, achievementId],
        xp: newXP,
        level: newLevel,
        xpToNextLevel: xpForNextLevel(newLevel)
      });
    }
  };

  const updateStreak = async () => {
    const currentProfile = userProfileRef.current;
    if (currentProfile) {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      if (currentProfile.lastPlayDate === today) {
        return; // Already played today
      }

      let newStreak = currentProfile.streak;
      if (currentProfile.lastPlayDate === yesterday) {
        newStreak += 1;
      } else if (currentProfile.lastPlayDate !== today) {
        newStreak = 1;
      }

      await saveProfile({
        ...currentProfile,
        streak: newStreak,
        lastPlayDate: today
      });
    }
  };

  return (
    <UserContext.Provider
      value={{
        userProfile,
        updateProfile,
        addXP,
        addFavorite,
        removeFavorite,
        addRecentlyPlayed,
        unlockAchievement,
        updateStreak
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
