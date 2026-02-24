import { Gamepad2 } from 'lucide-react';
import { motion } from 'motion/react';
import heroImage from '../assets/landingpg.jpg'; 

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col overflow-hidden relative">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-amber-500/10 animate-pulse" style={{ animationDuration: '4s' }}></div>
      
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between relative z-20">
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-br from-teal-400 to-cyan-500 p-1.5 rounded shadow-lg shadow-teal-500/50">
            <Gamepad2 className="size-5 text-black" />
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">PixelPop</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* <button className="text-teal-300/80 hover:text-teal-300 font-semibold text-sm transition-colors">
            Log in
          </button>
          <button className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-bold px-5 py-2 rounded text-sm transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/50">
            Sign up
          </button> */}
        </motion.div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Background Image */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/20 via-transparent to-[#0a0a0a]/40"></div>
          {/* Animated teal glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-teal-500/10 via-transparent to-transparent animate-pulse" style={{ animationDuration: '3s' }}></div>
        </motion.div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i % 3 === 0 ? '#14b8a6' : i % 3 === 1 ? '#24b7fb' : '#5eead4',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: 'blur(1px)',
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl">
          <motion.h1 
            className="text-center mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="block text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tight leading-[1.1]">
              Level Up Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500">
                Experience.
              </span>
            </span>
          </motion.h1>

          <motion.p 
            className="text-base sm:text-lg md:text-xl text-gray-300 mb-10 max-w-xl mx-auto leading-relaxed px-4 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Just a tiny collection of games I made in the little breaks between classes. 
            
          </motion.p>

          <motion.button
            onClick={onEnter}
            className="bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-teal-600 text-black text-lg font-black px-10 py-4 rounded-lg transition-all duration-200 shadow-xl inline-block relative overflow-hidden group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(220, 210, 185, 0.6)' }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Get started</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.5 }}
              style={{ opacity: 0.3 }}
            />
          </motion.button>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-teal-900/50 relative z-20 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2026 PixelPop. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {/* <a href="#" className="text-gray-500 hover:text-teal-400 text-sm transition-colors">About</a>
            <a href="#" className="text-gray-500 hover:text-teal-400 text-sm transition-colors">Contact</a>
            <a href="#" className="text-gray-500 hover:text-teal-400 text-sm transition-colors">Privacy</a> */}
          </div>
        </div>
      </footer>
    </div>
  );
}