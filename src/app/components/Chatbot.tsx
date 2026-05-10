import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowLeft, LogOut } from 'lucide-react';
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

export default function Chatbot({ onNavigate, onLogout }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hey there! I'm PixelBot, your gaming assistant. I can help you find the perfect game or answer any questions about PixelPop. What are you looking for today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      return 'Hey! Tell me what kind of game you want: easy, fast, educational, arcade, or challenging.';
    }

    return buildRecommendation(games, 'available games');
  };

  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
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
            { name: 'FRIENDS', page: 'friends' },
            { name: 'PROFILE', page: 'profile' }
          ].map((link) => (
            <button
              key={link.name}
              onClick={() => onNavigate(link.page)}
              className={`text-[11px] font-medium tracking-[0.12em] px-4 py-1.5 rounded-full transition-colors duration-200 ${
                link.page === 'chatbot' ? 'text-white bg-white/10' : 'text-white/90 hover:text-white'
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

      <main className="pt-32 px-10 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-6 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Bot size={40} />
            </div>
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                PixelBot
              </h1>
            </div>
          </div>
          <p className="text-white/60 text-xl mb-12">
            Your AI gaming assistant - Get personalized game recommendations and answers to your questions
          </p>

          <div className="liquid-glass rounded-3xl overflow-hidden flex flex-col h-[700px] shadow-2xl">
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-transparent to-white/[0.02]">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`
                  }}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                      message.sender === 'bot'
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-cyan-500/30'
                        : 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/30'
                    }`}
                  >
                    {message.sender === 'bot' ? <Bot size={22} /> : <User size={22} />}
                  </div>

                  <div
                    className={`max-w-[75%] rounded-3xl px-6 py-4 shadow-lg ${
                      message.sender === 'bot'
                        ? 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10'
                        : 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-cyan-500/30'
                    }`}
                  >
                    <p className="text-base leading-relaxed whitespace-pre-line">
                      {message.text}
                    </p>
                    <span
                      className={`text-xs mt-2 block ${
                        message.sender === 'bot' ? 'text-white/40' : 'text-white/60'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/10 p-6 bg-gradient-to-t from-white/5 to-transparent">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSending}
                  placeholder="Ask me anything about games..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all duration-300 disabled:opacity-60"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isSending}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl px-8 py-4 font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:shadow-none hover:scale-105 disabled:hover:scale-100"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
