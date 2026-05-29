import { useState } from 'react';
import { auth } from '../utils/auth';

interface SignupProps {
  onSignup: () => void;
  onSwitchToLogin: () => void;
}

export default function Signup({ onSignup, onSwitchToLogin }: SignupProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);

    try {
      await auth.signInWithGoogle();
      onSignup();
    } catch (err: any) {
      console.error('Signup error details:', err);
      setError(err.message || 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight bg-gradient-to-r from-purple-300 via-pink-300 to-white bg-clip-text text-transparent">
            PixelPop<sup className="text-2xl">TM</sup>
          </h1>
          <p className="text-white/60 text-base text-center mx-auto">Create your account to start playing</p>
        </div>

        {/* Signup Form */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-7 md:p-9 shadow-2xl" style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
          <div className="flex items-center gap-3 mb-7">
            
            <h2 className="text-2xl font-semibold tracking-tight">Join PixelPop</h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded-2xl text-red-300 text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-2xl px-4 py-3.5 hover:from-purple-400 hover:to-pink-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-7 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
            >
              {loading ? 'Redirecting...' : 'Continue with Google'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-purple-300 hover:text-purple-500 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
