import { Gamepad2, ArrowLeft, Sparkles, Send, Bot, User } from 'lucide-react';
import { motion } from 'motion/react';
import globedashimg from '../assets/globedash.png'; 
import guesstopiaimg from '../assets/guesstopia.png'; 
import neonstrikeimg from '../assets/neonstrike.png'; 
import flappyfrostimg from '../assets/flappyfrost.png'; 
import {useState} from 'react';




// GAME
export const badgecolor={
  "Educational": "bg-gradient-to-r from-teal-500 to-cyan-500", 
  "Action": "bg-gradient-to-r from-orange-500 to-amber-500",
  "Arcade": "bg-gradient-to-r from-blue-500 to-blue-800",
}
export const games = [
  {
    id: 1,
    name: "GlobeDash",
    image: globedashimg,
    link: "https://muskandhamuria.github.io/GlobeDash/",
    badge: "Educational",
    badgeColor: badgecolor["Educational"],
    code: "https://github.com/MuskanDhamuria/GlobeDash"
  },
  {
    id: 2,
    name: "GuessTopia",
    image:guesstopiaimg,
    link: "https://muskandhamuria.github.io/GuessTopia/",
    badge: "Educational",
    badgeColor: badgecolor["Educational"],
    code: "https://github.com/MuskanDhamuria/GuessTopia"
  },
    {
    id: 3,
    name: "NeonStrike",
    image:neonstrikeimg,
    link: "https://muskandhamuria.github.io/NeonStrike/",
    badge: "Action",
    badgeColor: badgecolor["Action"],
    code: "https://github.com/MuskanDhamuria/NeonStrike"
  },
  {
    id: 4,
    name: "Flappy Frost",
    image:flappyfrostimg,
    link: "https://muskandhamuria.github.io/FlappyFrost/",
    badge: "Arcade",
    badgeColor: badgecolor["Arcade"],
    code: "https://github.com/MuskanDhamuria/FlappyFrost"
  }
];



interface GamesDashboardProps {
  onBack: () => void;
}

type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
};

export function GamesDashboard({ onBack }: GamesDashboardProps) {

  const [selectedBadge, setSelectedBadge] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'games' | 'chatbot'>('games');
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      content: "Tell me what kind of game you want and I'll recommend from PixelPop.",
    },
  ]);

  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const geminiModel = import.meta.env.VITE_GEMINI_MODEL ?? 'gemini-1.5-flash';
  const quickPrompts = [
    'I want a fast action game',
    'Recommend educational games',
    'What is best for quick 5-minute play?',
  ];

  const askGeminiForRecommendations = async (userPrompt: string) => {
    const gamesContext = games
      .map((game) => `${game.name} (${game.badge}) - Play: ${game.link}`)
      .join('\n');

    const prompt = `You are the PixelPop game recommendation assistant.
Only recommend games from this exact list:
${gamesContext}

Rules:
- Recommend 1 to 3 games from the list only.
- Briefly explain each recommendation in one short line.
- If the user asks for something unavailable, suggest the closest match from the list.
- Keep answer concise.

User request: ${userPrompt}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 220,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error (${response.status})`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? '').join('').trim();

    if (!text) {
      throw new Error('No recommendation text returned.');
    }

    return text;
  };

  const handleSendMessage = async () => {
    const userPrompt = chatInput.trim();
    if (!userPrompt || isChatLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: userPrompt,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      if (!geminiApiKey) {
        throw new Error('Missing VITE_GEMINI_API_KEY');
      }

      const recommendation = await askGeminiForRecommendations(userPrompt);
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', content: recommendation },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to fetch recommendations.';
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: `I couldn't reach Gemini right now (${message}). Add VITE_GEMINI_API_KEY and try again.`,
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const badgeOptions = ["All", ...new Set(games.map((game) => game.badge))];
  return (
    
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col overflow-hidden relative">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-amber-500/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1),transparent_50%)]"></div>
      
      {/* Header */}
      <motion.header 
        className="px-6 py-6 flex items-center justify-between border-b border-teal-900/30 relative z-20 bg-black/20 backdrop-blur-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-teal-400 to-cyan-500 p-1.5 rounded shadow-lg shadow-teal-500/50">
            <Gamepad2 className="size-5 text-black" />
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">PixelPop</span>
        </div>
        <div className="flex items-center gap-4">
          {/* <button className="text-teal-300/80 hover:text-teal-300 font-semibold text-sm transition-colors">
            Log in
          </button>
          <button className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-bold px-5 py-2 rounded text-sm transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/50">
            Sign up
          </button> */}
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 text-teal-400/80 hover:text-teal-400 transition-colors duration-200 mb-10 group"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="size-4 transition-transform duration-200" />
            <span className="font-semibold text-sm">Back</span>
          </motion.button>

          {/* Page Title */}
          <motion.div 
            className="mb-12"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent"
                style={{ 
                  filter: 'drop-shadow(0 0 20px rgba(20, 184, 166, 0.4))'
                }}
              >
                Games
              </h1>
              {/* <motion.div
                animate={{ 
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                <Sparkles className="size-8 text-amber-400" />
              </motion.div> */}
            </div>
            <p className="text-lg text-teal-200/60">Explore and play all my creations</p>
          </motion.div>

          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => setActiveTab('games')}
              className={`px-4 py-2 rounded-md font-semibold text-sm transition ${
                activeTab === 'games'
                  ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-black'
                  : 'bg-gray-900 border border-teal-900/40 text-teal-200/80 hover:text-teal-200'
              }`}
            >
              Games
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`px-4 py-2 rounded-md font-semibold text-sm transition ${
                activeTab === 'chatbot'
                  ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-black'
                  : 'bg-gray-900 border border-teal-900/40 text-teal-200/80 hover:text-teal-200'
              }`}
            >
              Chatbot
            </button>
          </div>

          {activeTab === 'games' && (
            <>
          <div className="flex flex-col md:flex-row gap-4 mb-12">
              {/* Search Input */}
              <input
                type="text"
                placeholder="  Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 bg-gray-900 border border-teal-900/40 rounded-md text-white focus:outline-none focus:border-teal-500 transition"
              />

              {/* Badge Dropdown */}
              <select
              value={selectedBadge}
              onChange={(e) => setSelectedBadge(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-teal-900/40 rounded-md text-white focus:outline-none focus:border-teal-500 transition"
            >
              {badgeOptions.map((badge) => (
                <option key={badge} value={badge}  className="bg-gray-900 text-black">
                  {badge}
                </option>
              ))}
            </select>
            </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {games
              .filter((game)=>{
                const matchesBadge=
                  selectedBadge === "All" || game.badge === selectedBadge;
                const matchesSearch =
                  game.name.toLowerCase().includes(searchQuery.toLowerCase());
                
                return matchesBadge && matchesSearch;
              })
            .map((game, index) => (
              <motion.div
                key={game.id}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-lg overflow-hidden border border-teal-900/40 hover:border-teal-500/60 transition-all duration-200 group relative backdrop-blur-sm"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.2,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  boxShadow: '0 20px 40px rgba(20, 184, 166, 0.3)',
                  transition: { duration: 0.2 }
                }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-cyan-500/0 group-hover:from-teal-500/10 group-hover:to-cyan-500/10 transition-all duration-200 pointer-events-none"></div>
                
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-800">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Badge */}
                  <motion.div 
                    className="absolute top-3 left-3"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className={`${game.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg relative z-20`}>
                      {game.badge}
                    </span>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-5 relative z-10 flex flex-col gap-4">
                  <h3 className="text-xl font-black text-white mb-4 group-hover:text-teal-300 transition-colors duration-200">
                    {game.name}
                  </h3>

                  {/* Play Now Button */}
                  <motion.a
                    href={game.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-600 text-black text-lg font-black px-10 py-4 rounded-lg transition-all duration-200 shadow-xl inline-block relative overflow-hidden group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <span className="relative z-10">Play Now</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.3 }}
                      style={{ opacity: 0.4 }}
                    />
                  </motion.a>

                  {/* Learn More Link */}
                  <a
                    href={game.code}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="!underline decoration-teal-400 underline-offset-4 text-sm text-teal-300/80 hover:text-teal-400 transition-colors duration-200"
                  >
                    Learn More
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
          </>
          )}

          {activeTab === 'chatbot' && (
            <div className="w-full max-w-6xl grid lg:grid-cols-[280px_1fr] gap-4">
              <div className="bg-gray-950/70 border border-teal-900/40 rounded-xl p-4 backdrop-blur-sm">
                <h2 className="text-teal-300 font-bold mb-2">Chatbot</h2>
                <p className="text-sm text-teal-100/70 mb-4">
                  Ask for game picks by mood, genre, or session length.
                </p>
                <div className="space-y-2 mb-6">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setChatInput(prompt)}
                      className="w-full text-left px-3 py-2 rounded-md text-sm bg-gray-900/80 border border-teal-900/40 text-teal-100/90 hover:border-teal-500/60 transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-teal-400/80">Available games</p>
                  <div className="flex flex-wrap gap-2">
                    {games.map((game) => (
                      <span
                        key={game.id}
                        className="text-xs px-2 py-1 rounded-full bg-teal-900/40 border border-teal-700/40 text-teal-100/90"
                      >
                        {game.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-[560px] bg-gray-950/95 border border-teal-800/60 rounded-xl shadow-2xl shadow-teal-900/40 backdrop-blur-sm flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-teal-900/50 bg-gradient-to-r from-teal-900/30 to-cyan-900/20">
                  <div className="flex items-center gap-2 text-teal-200 font-semibold">
                    <Bot className="size-4" />
                    <span>Gemini Game Guide</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.08),transparent_55%)]">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-2 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="mt-1 p-1.5 rounded-full bg-teal-900/50 border border-teal-700/40">
                          <Bot className="size-3.5 text-teal-200" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                          message.role === 'assistant'
                            ? 'bg-teal-900/40 border border-teal-800/40 text-teal-100'
                            : 'bg-cyan-600/80 border border-cyan-400/40 text-white'
                        }`}
                      >
                        {message.content}
                      </div>
                      {message.role === 'user' && (
                        <div className="mt-1 p-1.5 rounded-full bg-cyan-900/60 border border-cyan-700/50">
                          <User className="size-3.5 text-cyan-100" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex items-start gap-2">
                      <div className="mt-1 p-1.5 rounded-full bg-teal-900/50 border border-teal-700/40">
                        <Bot className="size-3.5 text-teal-200" />
                      </div>
                      <div className="bg-teal-900/40 border border-teal-800/40 text-teal-100 rounded-2xl px-4 py-2.5 text-sm">
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-teal-900/50 bg-black/30">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Ask for game recommendations..."
                      className="flex-1 px-3 py-2.5 bg-black/40 border border-teal-900/50 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isChatLoading}
                      className="px-4 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-500 text-black rounded-lg font-semibold disabled:opacity-50"
                      aria-label="Send message"
                    >
                      <Send className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
