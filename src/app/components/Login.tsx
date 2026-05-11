import { useState } from 'react';
import { LogIn, Mail, Lock } from 'lucide-react';
import { auth } from '../utils/auth';

interface LoginProps {
  onLogin: () => void;
  onSwitchToSignup: () => void;
}

export default function Login({ onLogin, onSwitchToSignup }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await auth.signIn(email, password);
      if (result.session) {
        onLogin();
      } else {
        setError('Sign in failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Login error details:', err);

      // Provide more helpful error messages
      if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please confirm your email address before signing in.');
      } else {
        setError(err.message || 'Failed to sign in');
      }
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
            
            <h2 className="text-2xl font-semibold tracking-tight">Welcome Back</h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded-2xl text-red-300 text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold mb-2 text-white/75 uppercase tracking-[0.14em]">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/60 focus:bg-black transition-all duration-300 [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgb(0,0,0)] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
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
                  className="w-full bg-black border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/60 focus:bg-black transition-all duration-300 [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgb(0,0,0)] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold rounded-2xl px-4 py-3.5 hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-7 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
