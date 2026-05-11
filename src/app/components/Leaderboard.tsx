import { Medal, TrendingUp, ArrowLeft, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet } from '../utils/api';
import { useUser } from '../context/UserContext';

interface LeaderboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  score: number;
  games: number;
  level: number;
  progress: number;
}

export default function Leaderboard({ onNavigate, onLogout }: LeaderboardProps) {
  const { userProfile } = useUser();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet<LeaderboardEntry[]>('/leaderboard')
      .then(setLeaderboardData)
      .catch((error) => {
        console.error('Failed to load leaderboard:', error);
        setError(error instanceof Error ? error.message : 'Failed to load leaderboard.');
        setLeaderboardData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-white/40';
  };

  const currentUserRank = leaderboardData.find(
    (player) => player.username.toLowerCase() === (userProfile?.username ?? '').toLowerCase()
  )?.rank;

  const getRankMotivation = (rank?: number) => {
    if (!rank) return 'Play a few games and climb into the rankings.';
    if (rank === 1) return 'You are on top. Keep the crown with consistent wins.';
    if (rank <= 3) return 'Podium secured. One strong run could move you even higher.';
    if (rank <= 10) return 'You are in the top 10. Push a little more for podium range.';
    if (rank <= 25) return 'Great momentum. Another streak can break you into top 10.';
    return 'Steady progress pays off. Keep playing to rise through the board.';
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
                link.page === 'leaderboard' ? 'text-white bg-white/10' : 'text-white/90 hover:text-white'
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-3">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                Leaderboard
              </h1>
            </div>
          </div>
          <p className="text-white/60 text-base md:text-xl mb-8 md:mb-10 max-w-2xl">
            Top players across all games
          </p>

          {!loading && !error && leaderboardData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="rounded-2xl border border-yellow-400/30 bg-yellow-500/5 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-yellow-300/80 mb-1">Top Player</div>
                <div className="text-lg font-semibold text-white">{leaderboardData[0].username}</div>
                <div className="text-sm text-white/60">{leaderboardData[0].score.toLocaleString()} points</div>
              </div>
              <div className="rounded-2xl border border-cyan-400/25 bg-cyan-500/5 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-cyan-300/80 mb-1">Highest Score</div>
                <div className="text-lg font-semibold text-white">
                  {Math.max(...leaderboardData.map((player) => player.score)).toLocaleString()}
                </div>
                <div className="text-sm text-white/60">Across {leaderboardData.length} ranked players</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-white/60 mb-1">Your Position</div>
                <div className="text-lg font-semibold text-white">
                  {currentUserRank ? `#${currentUserRank}` : 'Unranked'}
                </div>
                <div className="text-sm text-white/60">{getRankMotivation(currentUserRank)}</div>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white/[0.02]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-white/[0.04] border-b border-white/10">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white/70 uppercase tracking-[0.14em]">Rank</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white/70 uppercase tracking-[0.14em]">Player</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white/70 uppercase tracking-[0.14em]">Score</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white/70 uppercase tracking-[0.14em]">Games Played</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white/70 uppercase tracking-[0.14em]">Level Progress</th>
                </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((player, index) => (
                    <tr
                      key={player.id}
                      className={`border-b border-white/5 hover:bg-white/[0.04] transition-all duration-300 ${
                        player.rank <= 3 ? 'bg-white/[0.02]' : ''
                      }`}
                      style={{
                        animation: `slideIn 0.5s ease-out ${index * 0.08}s both`
                      }}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Medal className={getMedalColor(player.rank)} size={22} />
                          <span className="text-xl font-bold">{player.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            player.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' :
                            player.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-black' :
                            player.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                            'bg-gradient-to-br from-cyan-500 to-blue-600'
                          }`}>
                            {player.username.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-base md:text-lg">{player.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-lg font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                          {player.score.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-white/80 text-base">{player.games}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-white/10 rounded-full h-2 max-w-[120px]">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                player.progress >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                              }`}
                              style={{ width: `${player.progress}%` }}
                            />
                          </div>
                          <span className={`font-bold text-sm ${
                            player.progress >= 80 ? 'text-green-400' : 'text-white/70'
                          }`}>
                            L{player.level}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {loading && (
              <div className="p-10 text-center text-white/60">Loading leaderboard...</div>
            )}
            {!loading && error && (
              <div className="p-10 text-center text-red-300">{error}</div>
            )}
            {!loading && !error && leaderboardData.length === 0 && (
              <div className="p-10 text-center text-white/60">No leaderboard entries yet.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
