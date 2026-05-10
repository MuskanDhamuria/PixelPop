import { ExternalLink, Code, ArrowLeft, LogOut, Heart, Search, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchGames, Game, getBadgeColor, submitGameReview } from '../data/games';
import { useUser } from '../context/UserContext';
import { auth } from '../utils/auth';

interface DashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Dashboard({ onNavigate, onLogout }: DashboardProps) {
  const { userProfile, addFavorite, removeFavorite, addRecentlyPlayed } = useUser();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'rating'>('name');
  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [reviewDrafts, setReviewDrafts] = useState<Record<number, { rating: number; comment: string }>>({});
  const [reviewError, setReviewError] = useState('');
  const [submittingReviewId, setSubmittingReviewId] = useState<number | null>(null);

  useEffect(() => {
    fetchGames()
      .then(setGames)
      .catch((error) => {
        console.error('Failed to load games:', error);
        setGames([]);
      })
      .finally(() => setLoadingGames(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(games.map((game) => game.badge)))];
  const difficulties = ['All', ...Array.from(new Set(games.map((game) => game.difficulty)))];

  let filteredGames = games;

  // Category filter
  if (selectedFilter !== 'All') {
    filteredGames = filteredGames.filter(game => game.badge === selectedFilter);
  }

  // Difficulty filter
  if (difficultyFilter !== 'All') {
    filteredGames = filteredGames.filter(game => game.difficulty === difficultyFilter);
  }

  // Search filter
  if (searchQuery) {
    filteredGames = filteredGames.filter(game =>
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort
  filteredGames = [...filteredGames].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    return a.name.localeCompare(b.name);
  });

  const handleGameClick = async (game: Game, event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const gameWindow = window.open('about:blank', '_blank');
    if (gameWindow) {
      gameWindow.opener = null;
    }

    await addRecentlyPlayed(game.id, game.name);

    if (gameWindow) {
      gameWindow.location.href = game.link;
    } else {
      window.location.href = game.link;
    }
  };

  const toggleFavorite = (gameId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (userProfile?.favorites.includes(gameId)) {
      removeFavorite(gameId);
    } else {
      addFavorite(gameId);
    }
  };

  const formatReviewDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
  };

  const handleReviewChange = (gameId: number, updates: Partial<{ rating: number; comment: string }>) => {
    setReviewDrafts((drafts) => ({
      ...drafts,
      [gameId]: {
        rating: drafts[gameId]?.rating ?? 5,
        comment: drafts[gameId]?.comment ?? '',
        ...updates,
      },
    }));
  };

  const handleSubmitReview = async (gameId: number) => {
    const draft = reviewDrafts[gameId] ?? { rating: 5, comment: '' };
    const comment = draft.comment.trim();
    if (!comment || submittingReviewId) return;

    setSubmittingReviewId(gameId);
    setReviewError('');

    try {
      const accessToken = await auth.getAccessToken();
      if (!accessToken) {
        setReviewError('Please log in to write a review.');
        return;
      }

      const updatedGame = await submitGameReview(gameId, draft.rating, comment, accessToken);
      setGames((currentGames) => currentGames.map((game) => (game.id === updatedGame.id ? updatedGame : game)));
      setReviewDrafts((drafts) => ({ ...drafts, [gameId]: { rating: 5, comment: '' } }));
    } catch (error) {
      console.error('Failed to submit review:', error);
      setReviewError(error instanceof Error ? error.message : 'Failed to submit review.');
    } finally {
      setSubmittingReviewId(null);
    }
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
                link.page === 'dashboard' ? 'text-white bg-white/10' : 'text-white/90 hover:text-white'
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
      <main className="pt-32 px-10 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Game Library
            </h1>
            <p className="text-white/60 text-xl">
              Choose your next adventure from our collection of thrilling games
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-6 mb-12">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games by name or description..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all duration-300"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="flex gap-2">
                <span className="text-sm text-white/60 self-center mr-2">Category:</span>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedFilter(category)}
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                      selectedFilter === category
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                        : 'liquid-glass text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="h-6 w-px bg-white/10" />

              <div className="flex gap-2">
                <span className="text-sm text-white/60 self-center mr-2">Difficulty:</span>
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setDifficultyFilter(difficulty)}
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                      difficultyFilter === difficulty
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                        : 'liquid-glass text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>

              <div className="h-6 w-px bg-white/10" />

              <div className="flex gap-2">
                <span className="text-sm text-white/60 self-center mr-2">Sort:</span>
                <button
                  onClick={() => setSortBy('name')}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    sortBy === 'name'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50'
                      : 'liquid-glass text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Name
                </button>
                <button
                  onClick={() => setSortBy('rating')}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    sortBy === 'rating'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50'
                      : 'liquid-glass text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Rating
                </button>
              </div>
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredGames.map((game, index) => (
              <div
                key={game.id}
                className="liquid-glass rounded-3xl overflow-hidden group hover:scale-[1.03] transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Game Image */}
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-white/10 to-white/5">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-125 group-hover:rotate-2 transition-all duration-700"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Badge and Favorite */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <button
                      onClick={(e) => toggleFavorite(game.id, e)}
                      className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/70 transition-all"
                    >
                      <Heart
                        size={20}
                        className={userProfile?.favorites.includes(game.id) ? 'fill-pink-500 text-pink-500' : 'text-white'}
                      />
                    </button>
                    <span
                      className={`${game.badgeColor ?? getBadgeColor(game.badge)} px-4 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md shadow-lg`}
                    >
                      {game.badge}
                    </span>
                  </div>
                </div>

                {/* Game Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-cyan-400 transition-colors duration-300">
                    {game.name}
                  </h3>
                  <p className="text-sm text-white/60 mb-3">{game.description}</p>

                  {/* Game Meta */}
                  <div className="flex items-center gap-3 mb-4 text-xs text-white/50">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400 fill-yellow-400" size={14} />
                      <span className="text-white/70">{game.reviewCount > 0 ? game.rating.toFixed(1) : 'No rating'}</span>
                    </div>
                    <span>•</span>
                    <span>{game.difficulty}</span>
                    <span>•</span>
                    <span>{game.duration}</span>
                    <span>•</span>
                    <span>{game.reviewCount} reviews</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <a
                      href={game.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => handleGameClick(game, event)}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold rounded-xl px-4 py-3 flex items-center justify-center gap-2 hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105"
                    >
                      Play Now
                      <ExternalLink size={16} />
                    </a>
                    <a
                      href={game.code}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 text-white text-sm font-semibold rounded-xl px-4 py-3 flex items-center justify-center gap-2 hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 hover:scale-105"
                    >
                      <Code size={16} />
                    </a>
                  </div>

                  <div className="mt-5 border-t border-white/10 pt-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-white/80">Reviews</h4>
                      <span className="text-xs text-white/40">{game.reviewCount} total</span>
                    </div>

                    <div className="space-y-3 mb-4 max-h-36 overflow-y-auto pr-1">
                      {game.reviews.length === 0 ? (
                        <p className="text-xs text-white/40">No reviews yet.</p>
                      ) : (
                        game.reviews.slice(0, 3).map((review) => (
                          <div key={review.id} className="rounded-xl bg-white/5 border border-white/10 p-3">
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <span className="text-xs font-semibold text-white/80">{review.username}</span>
                              <span className="text-xs text-yellow-300">{review.rating}/5</span>
                            </div>
                            <p className="text-xs text-white/60 leading-relaxed">{review.comment}</p>
                            <div className="text-[11px] text-white/30 mt-1">{formatReviewDate(review.timestamp)}</div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => {
                          const selectedRating = reviewDrafts[game.id]?.rating ?? 5;
                          return (
                            <button
                              key={rating}
                              onClick={() => handleReviewChange(game.id, { rating })}
                              className="text-yellow-400 hover:scale-110 transition-transform"
                              aria-label={`${rating} star review`}
                            >
                              <Star
                                size={16}
                                className={rating <= selectedRating ? 'fill-yellow-400' : 'fill-transparent'}
                              />
                            </button>
                          );
                        })}
                      </div>
                      <textarea
                        value={reviewDrafts[game.id]?.comment ?? ''}
                        onChange={(event) => handleReviewChange(game.id, { comment: event.target.value })}
                        placeholder="Write a review..."
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 resize-none"
                      />
                      <button
                        onClick={() => handleSubmitReview(game.id)}
                        disabled={!reviewDrafts[game.id]?.comment?.trim() || submittingReviewId === game.id}
                        className="w-full bg-white/10 text-white text-xs font-semibold rounded-xl px-4 py-2 hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingReviewId === game.id ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {reviewError && (
            <div className="liquid-glass rounded-2xl p-4 mt-8 text-center text-red-300">
              {reviewError}
            </div>
          )}
          {!loadingGames && filteredGames.length === 0 && (
            <div className="liquid-glass rounded-3xl p-10 text-center text-white/60">
              No games are available right now.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
