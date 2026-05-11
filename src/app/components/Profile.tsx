import { ArrowLeft, LogOut, User, Trophy, Heart, Clock, Edit, Award } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Achievement, fetchAchievements, getRarityColor } from '../data/achievements';
import { fetchGames, Game } from '../data/games';
import { DailyChallenge, fetchDailyChallenges } from '../data/challenges';
import { xpProgress } from '../types/user';
import { useEffect, useState } from 'react';

interface ProfileProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Profile({ onNavigate, onLogout }: ProfileProps) {
  const { userProfile, updateProfile, addXP } = useUser();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [games, setGames] = useState<Game[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);

  useEffect(() => {
    Promise.all([fetchGames(), fetchAchievements(), fetchDailyChallenges()])
      .then(([loadedGames, loadedAchievements, loadedChallenges]) => {
        setGames(loadedGames);
        setAchievements(loadedAchievements);
        setDailyChallenges(loadedChallenges);
      })
      .catch((error) => {
        console.error('Failed to load profile content:', error);
      });
  }, []);

  if (!userProfile) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading profile...</div>;
  }

  const favoriteGames = games.filter(g => userProfile.favorites.includes(g.id));
  const unlockedAchievements = achievements.filter(a => userProfile.achievements.includes(a.id));
  const progress = xpProgress(userProfile.xp, userProfile.level);

  const handleSaveBio = () => {
    updateProfile({ bio });
    setEditing(false);
  };

  const completeDailyChallenge = (xp: number) => {
    addXP(xp);
  };

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-10 py-8 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back</span>
          </button>
          <div className="text-[17px] font-semibold tracking-tight">
            PixelPop<sup>TM</sup>
          </div>
        </div>

        <nav className="liquid-glass rounded-full px-2 py-2 flex items-center gap-1">
          {[
            { name: 'GAMES', page: 'dashboard' },
            { name: 'LEADERBOARD', page: 'leaderboard' },
            { name: 'COMMUNITY', page: 'community' },
            { name: 'CHATBOT', page: 'chatbot' },
            { name: 'FRIENDS', page: 'friends' },
            { name: 'PROFILE', page: 'profile' }
          ].map((link) => (
            <button
              key={link.name}
              onClick={() => onNavigate(link.page)}
              className={`text-[11px] font-medium tracking-[0.12em] px-4 py-1.5 rounded-full transition-colors duration-200 ${
                link.page === 'profile' ? 'text-white bg-white/10' : 'text-white/90 hover:text-white'
              }`}
            >
              {link.name}
            </button>
          ))}
        </nav>

        <button
          onClick={onLogout}
          className="liquid-glass rounded-full px-5 py-2.5 text-[11px] font-medium tracking-[0.12em] text-white/90 hover:text-white transition-colors duration-200 flex items-center gap-2"
        >
          <LogOut size={14} />
          LOGOUT
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-28 px-6 md:px-10 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Profile Header */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 md:p-10 mb-8 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
              {/* Avatar */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <User size={56} />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4">
                  <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{userProfile.username}</h1>
                  <div className="px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-sm">
                    Level {userProfile.level}
                  </div>
                </div>

                {/* XP Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">XP Progress</span>
                    <span className="text-white/70">{userProfile.xp} / {userProfile.xpToNextLevel}</span>
                  </div>
                  <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Bio */}
                {editing ? (
                  <div>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 resize-none"
                      rows={3}
                    />
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={handleSaveBio}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="bg-white/10 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-white/20 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <p className="text-white/70 flex-1 leading-relaxed text-[15px]">{userProfile.bio}</p>
                    <button
                      onClick={() => setEditing(true)}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-8">
                  <div className="text-center rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="text-3xl font-bold text-cyan-400">{userProfile.gamesPlayed}</div>
                    <div className="text-sm text-white/60">Games Played</div>
                  </div>
                  <div className="text-center rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="text-3xl font-bold text-purple-400">{unlockedAchievements.length}</div>
                    <div className="text-sm text-white/60">Achievements</div>
                  </div>
                  <div className="text-center rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="text-3xl font-bold text-pink-400">{userProfile.friends.length}</div>
                    <div className="text-sm text-white/60">Friends</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Achievements */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 md:p-8 shadow-xl mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="text-yellow-400" size={32} />
                  <h2 className="text-2xl font-bold">Achievements</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {achievements.map((achievement) => {
                    const unlocked = userProfile.achievements.includes(achievement.id);
                    return (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-2xl border transition-all duration-300 ${
                          unlocked
                            ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} border-white/20 shadow-lg`
                            : 'bg-black border-white/10 opacity-55'
                        }`}
                      >
                        <div className="text-3xl mb-2">{achievement.icon}</div>
                        <div className="font-semibold mb-1">{achievement.name}</div>
                        <div className="text-xs text-white/60">{achievement.description}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Favorites */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 md:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="text-pink-400" size={32} />
                  <h2 className="text-2xl font-bold">Favorite Games</h2>
                </div>
                {favoriteGames.length === 0 ? (
                  <p className="text-white/50 text-center py-8">No favorite games yet</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favoriteGames.map((game) => (
                      <div
                        key={game.id}
                        className="rounded-2xl overflow-hidden border border-white/10 bg-black hover:border-white/20 transition-all duration-300 cursor-pointer"
                        onClick={() => onNavigate('dashboard')}
                      >
                        <img src={game.image} alt={game.name} className="w-full h-32 object-cover" />
                        <div className="p-3">
                          <div className="font-semibold">{game.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Daily Challenges
              <div className="liquid-glass rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="text-green-400" size={28} />
                  <h2 className="text-xl font-bold">Daily Challenges</h2>
                </div>
                <div className="space-y-4">
                  {dailyChallenges.map((challenge) => (
                    <div key={challenge.id} className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{challenge.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{challenge.title}</div>
                          <div className="text-xs text-white/60">{challenge.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-green-400">+{challenge.xpReward} XP</span>
                        <button
                          onClick={() => completeDailyChallenge(challenge.xpReward)}
                          className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-1.5 rounded-lg font-semibold hover:from-green-400 hover:to-emerald-400 transition-all"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Recently Played */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="text-blue-400" size={28} />
                  <h2 className="text-xl font-bold">Recently Played</h2>
                </div>
                {userProfile.recentlyPlayed.length === 0 ? (
                  <p className="text-white/50 text-center py-4 text-sm">No recent games</p>
                ) : (
                  <div className="space-y-3">
                    {userProfile.recentlyPlayed.slice(0, 5).map((recent, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-black border border-white/10 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
                        onClick={() => onNavigate('dashboard')}
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{recent.gameName}</div>
                          <div className="text-xs text-white/50">
                            {new Date(recent.playedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
