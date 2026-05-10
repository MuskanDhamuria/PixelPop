import { useEffect, useRef, useState } from 'react';
import { Lock, LogOut } from 'lucide-react';

interface LandingPageProps {
  onEnter: (page: string) => void;
  onLogout?: () => void;
  isAuthenticated?: boolean;
}

export default function LandingPage({ onEnter, onLogout, isAuthenticated = false }: LandingPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.25;
    }
  };

  return (
    <div
      className="min-h-screen bg-black text-white overflow-x-hidden relative"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Video Background */}
      <div className="fixed inset-0 z-0 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          className="w-full h-full object-cover scale-[1.08] origin-center"
          src="
          https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_024928_1efd0b0d-6c02-45a8-8847-1030900c4f63.mp4
          "
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-10 py-8 flex justify-between items-center">
        <div className="text-[17px] font-semibold tracking-tight">
          PixelPop<sup>TM</sup>
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
              onClick={() => onEnter(link.page)}
              className="text-[11px] font-medium tracking-[0.12em] text-white/90 hover:text-white px-4 py-1.5 rounded-full transition-colors duration-200"
            >
              {link.name}
            </button>
          ))}
        </nav>

        {isAuthenticated ? (
          <button
            onClick={onLogout}
            className="liquid-glass rounded-full px-5 py-2.5 text-[11px] font-medium tracking-[0.12em] text-white/90 hover:text-white transition-colors duration-200 flex items-center gap-2"
          >
            <LogOut size={14} />
            LOGOUT
          </button>
        ) : (
          <div className="liquid-glass rounded-full px-5 py-2.5 text-[11px] font-medium tracking-[0.12em] text-white/40 cursor-not-allowed">
            GUEST 
          </div>
        )}
      </header>

      {/* Hero Headline */}
      <div
        className="fixed left-0 right-0 z-20 flex flex-col items-center transition-all duration-1000"
        style={{
          top: '120px',
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'translateY(0)' : 'translateY(24px)',
        }}
      >
        <h1
          className="text-center font-normal"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(40px, 5.4vw, 72px)',
            lineHeight: '1.1',
            letterSpacing: '-0.02em',
          }}
        >
          {/* <div className="text-white text-shadow text-center">A small collection of games I made</div>
          <div style={{ color: 'rgba(255,255,255,0.55)' }}>
            Hope you like them!
          </div> */}
        </h1>
      </div>

      {/* Bottom Block */}
      <div
        className="fixed left-0 right-0 z-20 flex flex-col items-center gap-6 transition-all duration-1000"
        style={{
          bottom: '56px',
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'translateY(0)' : 'translateY(24px)',
          transitionDelay: '300ms',
        }}
      >
        {/* <p className="max-w-[620px] text-[15px] leading-relaxed text-center px-4">
          <span className="text-white">
            Our matchmaking adapts to you — your playstyle, your strategy, your hunger for victory.
          </span>
          <span className="text-white/55">
            {' '}Each match is balanced, immersive, and entirely unforgettable.
          </span>
        </p> */}

        <button
          onClick={() => onEnter('dashboard')}
          className="bg-white text-black text-[15px] font-medium rounded-full px-8 py-3.5 transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_32px_4px_rgba(255,255,255,0.2)] active:scale-[0.97]"
        >
          Start playing today
        </button>

        <div className="flex items-center gap-2">
          <Lock size={13} strokeWidth={1.5} className="text-white/70" />
          {/* <span className="text-[11px] font-medium tracking-[0.14em] text-white/70">
            ANTI-CHEAT PROTECTED. ZERO TOLERANCE.
          </span> */}
        </div>
      </div>
    </div>
  );
}
