import { useState } from 'react';
import { auth } from '../utils/auth';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await auth.signInWithGoogle();
      onLogin();
    } catch (err: any) {
      console.error('Login error details:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight bg-gradient-to-r from-cyan-300 via-blue-300 to-white bg-clip-text text-transparent">
            PixelPop<sup className="text-2xl">TM</sup>
          </h1>
          <p className="text-white/60 text-base text-center mx-auto">Sign in to continue your gaming journey</p>
        </div>

        {/* Login Form */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-7 md:p-9 shadow-2xl" style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
          <div className="flex items-center gap-3 mb-7">
            
            <h2 className="text-2xl font-semibold tracking-tight text-center">Welcome!</h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded-2xl text-red-300 text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold rounded-2xl px-4 py-3.5 hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-7 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
            >
              {loading ? 'Redirecting...' : 'Continue with Google'}
            </button>
          </div>

          <div className="mt-6 text-center text-white/60 text-sm">
            
          </div>
        </div>
      </div>
    </div>
  );
}
