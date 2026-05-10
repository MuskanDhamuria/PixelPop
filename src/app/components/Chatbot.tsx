import { useState, useRef, useEffect } from 'react';

import { Send, Bot, User, ArrowLeft, LogOut, Sparkles, Gamepad2, MessageCircle, Shuffle} from 'lucide-react';
import { fetchGames, Game } from '../data/games';
import { apiPost } from '../utils/api';

interface ChatbotProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotResponse {
  reply: string;
}

const navLinks = [
  { name: 'GAMES', page: 'dashboard' },
  { name: 'LEADERBOARD', page: 'leaderboard' },
  { name: 'COMMUNITY', page: 'community' },
  { name: 'CHATBOT', page: 'chatbot' },
  { name: 'FRIENDS', page: 'friends' },
  { name: 'PROFILE', page: 'profile' }
];

const quickPrompts = [
  'Easy game',
  'Fast game',
  'Educational game',
  'Best rated game'
];

export default function Chatbot({ onNavigate, onLogout }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hey there. I'm PixelBot. Tell me what kind of game you feel like playing and I will narrow it down.",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [randomGame, setRandomGame] = useState<Game | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchGames()
      .then(setGames)
      .catch((error) => {
        console.error('Failed to load games for chatbot:', error);
        setGames([]);
      });
  }, []);

  const buildRecommendation = (matchingGames: Game[], label: string) => {
    if (matchingGames.length === 0) {
      return `I do not see any ${label} in the library right now. Check the game library for the latest available titles.`;
    }

    const gameList = matchingGames
      .slice(0, 3)
      .map((game) => `${game.name} (${game.difficulty}, ${game.duration})`)
      .join(', ');

    return `I found ${matchingGames.length} ${label}: ${gameList}.`;
  };

  const getFallbackResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    const easyWords = ['easy', 'simple', 'beginner', 'relaxing', 'chill'];
    const hardWords = ['hard', 'difficult', 'challenge', 'challenging'];
    const fastWords = ['fast', 'quick', 'action', 'exciting'];

    if (easyWords.some((word) => lowerMessage.includes(word))) {
      return buildRecommendation(games.filter((game) => game.difficulty === 'Easy'), 'easy games');
    }

    if (hardWords.some((word) => lowerMessage.includes(word))) {
      return buildRecommendation(games.filter((game) => game.difficulty === 'Hard'), 'hard games');
    }

    if (fastWords.some((word) => lowerMessage.includes(word))) {
      return buildRecommendation(games.filter((game) => game.badge.toLowerCase().includes('action') || game.duration === '5min'), 'fast games');
    }

    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('what game')) {
      if (lowerMessage.includes('educational') || lowerMessage.includes('learn')) {
        return buildRecommendation(games.filter((game) => game.badge.toLowerCase().includes('education')), 'educational games');
      }
      if (lowerMessage.includes('arcade') || lowerMessage.includes('casual')) {
        return buildRecommendation(games.filter((game) => game.badge.toLowerCase().includes('arcade')), 'arcade games');
      }
      return buildRecommendation(games, 'available games');
    }

    if (lowerMessage.includes('leaderboard') || lowerMessage.includes('rank') || lowerMessage.includes('top player')) {
      return 'Open the Leaderboard page to see top players ranked by XP and games played.';
    }

    if (lowerMessage.includes('community') || lowerMessage.includes('friends') || lowerMessage.includes('social')) {
      return 'You can use Community to post updates, and Friends to add people and chat with them.';
    }

    const matchedGame = games.find((game) => lowerMessage.includes(game.name.toLowerCase()));
    if (matchedGame) {
      return `${matchedGame.name}: ${matchedGame.description} It is ${matchedGame.difficulty}, takes about ${matchedGame.duration}, and supports ${matchedGame.playerCount} player(s).`;
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what can you')) {
      return 'I can recommend games by difficulty, genre, duration, or mood. Try asking for an easy game, a fast game, or an educational game.';
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'Hey. Tell me what kind of game you want: easy, fast, educational, arcade, or challenging.';
    }

    return buildRecommendation(games, 'available games');
  };

  const sendMessage = async (text: string) => {
    const trimmedInput = text.trim();
    if (!trimmedInput || isSending) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: trimmedInput,
      sender: 'user',
      timestamp: new Date()
    };
    const thinkingMessage: Message = {
      id: messages.length + 2,
      text: 'Thinking...',
      sender: 'bot',
      timestamp: new Date()
    };
    const nextMessages = [...messages, userMessage];

    setMessages([...nextMessages, thinkingMessage]);
    setInputValue('');
    setIsSending(true);

    try {
      const response = await apiPost<ChatbotResponse>('/chatbot', {
        message: trimmedInput,
        history: nextMessages.map((message) => ({
          sender: message.sender,
          text: message.text,
        })),
        games: games.map((game) => ({
          name: game.name,
          description: game.description,
          badge: game.badge,
          difficulty: game.difficulty,
          playerCount: game.playerCount,
          duration: game.duration,
          rating: game.rating,
        })),
      });

      setMessages([...nextMessages, {
        ...thinkingMessage,
        text: response.reply,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Failed to get chatbot response:', error);
      setMessages([...nextMessages, {
        ...thinkingMessage,
        text: getFallbackResponse(trimmedInput),
        timestamp: new Date(),
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = () => sendMessage(inputValue);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const spinRandomGame = () => {
    if (games.length === 0 || isSpinning) return;

    setIsSpinning(true);
    let spinCount = 0;
    const spinTimer = window.setInterval(() => {
      setRandomGame(games[Math.floor(Math.random() * games.length)]);
      spinCount += 1;

      if (spinCount >= 12) {
        window.clearInterval(spinTimer);
        setRandomGame(games[Math.floor(Math.random() * games.length)]);
        setIsSpinning(false);
      }
    }, 90);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-white overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_12%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(244,114,182,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_36%)]" />

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#050608]/85 px-4 py-4 backdrop-blur-xl lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <button
              onClick={() => onNavigate('landing')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-colors hover:border-white/20 hover:text-white"
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0">
              <div className="text-[17px] font-semibold tracking-tight">
                PixelPop<sup>TM</sup>
              </div>
              <div className="text-xs text-white/45">PixelBot assistant</div>
            </div>
          </div>

          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 lg:flex">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => onNavigate(link.page)}
                className={`rounded-full px-4 py-2 text-[11px] font-medium tracking-[0.12em] transition-colors duration-200 ${
                  link.page === 'chatbot'
                    ? 'bg-white text-black'
                    : 'text-white/70 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>

          <button
            onClick={onLogout}
            className="flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[11px] font-medium tracking-[0.12em] text-white/80 transition-colors hover:border-white/20 hover:text-white"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">LOGOUT</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-6 px-4 pb-8 pt-28 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-10">
        <aside className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400 text-black shadow-lg shadow-cyan-500/20">
                <Bot size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">PixelBot</h1>
                <p className="text-sm text-white/55">AI assistant to recommend you games!</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-white/55">
                  <Gamepad2 size={15} />
                  <span className="text-xs uppercase tracking-[0.14em]">Games</span>
                </div>
                <div className="mt-3 text-2xl font-semibold">{games.length || '-'}</div>
              </div> */}
              {/* <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-white/55">
                  <MessageCircle size={15} />
                  <span className="text-xs uppercase tracking-[0.14em]">Chats</span>
                </div>
                <div className="mt-3 text-2xl font-semibold">{Math.max(messages.length - 1, 0)}</div>
              </div> */}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white/75">
              <Sparkles size={16} className="text-cyan-300" />
              Quick picks
            </div>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={isSending}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/75 transition-colors hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </section>

          {/* {featuredGames.length > 0 && (
            <section className="hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl lg:block">
              <div className="mb-4 text-sm font-medium text-white/75">Top matches</div>
              <div className="space-y-3">
                {featuredGames.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => sendMessage(`Tell me about ${game.name}`)}
                    disabled={isSending}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-left transition-colors hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <img src={game.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">{game.name}</div>
                      <div className="mt-1 text-xs text-white/50">{game.difficulty} · {game.duration}</div>
                    </div>
                  </button>
                ))}
              </div>
            </section> */}
          {/* )} */}

             {games.length > 0 && (
            <section className="hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl lg:block">
                <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-white/75">Game randomizer</div>
                  <div className="mt-1 text-xs text-white/45">Spin when you cannot decide</div>
                </div>
                <button
                  onClick={spinRandomGame}
                  disabled={isSpinning}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300 text-black transition-colors hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Spin random game"
                >
                  <Shuffle size={18} className={isSpinning ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                {randomGame ? (
                  <div>
                    <img
                      src={randomGame.image}
                      alt=""
                      className={`h-36 w-full rounded-xl object-cover transition-opacity duration-200 ${isSpinning ? 'opacity-55' : 'opacity-100'}`}
                    />
                    <div className="mt-4">
                      <div className="text-base font-semibold text-white">{randomGame.name}</div>
                      <div className="mt-1 text-xs text-white/50">{randomGame.difficulty} · {randomGame.duration} · {randomGame.badge}</div>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/60">{randomGame.description}</p>
                    </div>
                    
                  </div>
                ) : (
                  <button 
                      onClick={spinRandomGame}
                    disabled={isSpinning}
                    className="flex min-h-52 w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/15 text-center transition-colors hover:border-cyan-300/40 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-60"
                  ></button>
                )} </div>
            </section> )}
        </aside>

        <section className="flex min-h-[680px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d12]/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <div className="text-sm font-medium text-white">Conversation</div>
              <div className="text-xs text-white/45">{isSending ? 'PixelBot is thinking' : 'Ready'}</div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Online
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            <div className="space-y-5">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  style={{
                    animation: `fadeInUp 0.35s ease-out ${Math.min(index, 6) * 0.035}s both`
                  }}
                >
                  {message.sender === 'bot' && (
                    <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-300 text-black">
                      <Bot size={18} />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-5 py-4 shadow-lg sm:max-w-[70%] ${
                      message.sender === 'bot'
                        ? 'border border-white/10 bg-white/[0.06] text-white'
                        : 'bg-white text-black'
                    }`}
                  >
                    {message.text === 'Thinking...' ? (
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 [animation-delay:120ms]" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 [animation-delay:240ms]" />
                      </div>
                    ) : (
                      <p className="whitespace-pre-line text-[15px] leading-7">
                        {message.text}
                      </p>
                    )}
                    <span
                      className={`mt-3 block text-[11px] ${
                        message.sender === 'bot' ? 'text-white/40' : 'text-black/45'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {message.sender === 'user' && (
                    <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                      <User size={18} />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-white/10 bg-black/20 p-4 sm:p-5">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSending}
                placeholder="Ask for an easy game, a fast game, or details about a title"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-[15px] text-white outline-none placeholder:text-white/35 disabled:opacity-60"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isSending}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-300 text-black transition-colors hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/35"
                aria-label="Send message"
              >
                <Send size={19} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
