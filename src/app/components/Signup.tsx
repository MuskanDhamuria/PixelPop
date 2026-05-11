import { useState } from 'react';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { auth } from '../utils/auth';

interface SignupProps {
  onSignup: () => void;
  onSwitchToLogin: () => void;
}

export default function Signup({ onSignup, onSwitchToLogin }: SignupProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await auth.signUp(email, password, username);

      // Check if email confirmation is required
      if (result.session) {
        // User is automatically signed in
        onSignup();
      } else if (result.user && !result.session) {
        // Email confirmation required
        setError('Please check your email to confirm your account before signing in.');
        setLoading(false);
      } else {
        onSignup();
      }
    } catch (err: any) {
      console.error('Signup error details:', err);
      setError(err.message || 'Failed to create account');
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold mb-2 text-white/75 uppercase tracking-[0.14em]">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-black border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/60 focus:bg-black transition-all duration-300 [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgb(0,0,0)] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 text-white/75 uppercase tracking-[0.14em]">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/60 focus:bg-black transition-all duration-300 [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgb(0,0,0)] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 text-white/75 uppercase tracking-[0.14em]">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-black border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/60 focus:bg-black transition-all duration-300 [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgb(0,0,0)] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                  placeholder="Create a password (min 6 characters)"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-2xl px-4 py-3.5 hover:from-purple-400 hover:to-pink-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-7 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

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
