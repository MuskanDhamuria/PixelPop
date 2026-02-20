import { Gamepad2, ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import globedashimg from '../assets/globedash.png'; 
import guesstopiaimg from '../assets/guesstopia.png'; 



// 🎮 EDIT THIS ARRAY TO ADD/UPDATE YOUR GAMES
export const badgecolor={
  "Educational": "bg-gradient-to-r from-teal-500 to-cyan-500", 
  "Action": "bg-gradient-to-r from-orange-500 to-amber-500"
}
export const games = [
  {
    id: 1,
    name: "GlobeDash",
    image: globedashimg,
    link: "https://muskandhamuria.github.io/GlobeDash/",
    badge: "Educational",
    badgeColor: badgecolor["Educational"],
  },
  {
    id: 2,
    name: "GuessTopia",
    image:guesstopiaimg,
    link: "https://muskandhamuria.github.io/GuessTopia/",
    badge: "Educational",
    badgeColor: badgecolor["Educational"],
  }
];

interface GamesDashboardProps {
  onBack: () => void;
}

export function GamesDashboard({ onBack }: GamesDashboardProps) {
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
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent"
                style={{ 
                  filter: 'drop-shadow(0 0 20px rgba(20, 184, 166, 0.4))'
                }}
              >
                My Games
              </h1>
              <motion.div
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
              </motion.div>
            </div>
            <p className="text-lg text-teal-200/60">Explore and play all my creations</p>
          </motion.div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, index) => (
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
                    <span className={`${game.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
                      {game.badge}
                    </span>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-5 relative z-10">
                  <h3 className="text-xl font-black text-white mb-4 group-hover:text-teal-300 transition-colors duration-200">
                    {game.name}
                  </h3>
                  <motion.a
                    href={game.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-bold text-center px-6 py-2.5 rounded transition-all duration-200 relative overflow-hidden group/button"
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
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-teal-900/30 mt-12 relative z-20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2026 PixelPop. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-500 hover:text-teal-400 text-sm transition-colors">About</a>
            <a href="#" className="text-gray-500 hover:text-teal-400 text-sm transition-colors">Contact</a>
            <a href="#" className="text-gray-500 hover:text-teal-400 text-sm transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}