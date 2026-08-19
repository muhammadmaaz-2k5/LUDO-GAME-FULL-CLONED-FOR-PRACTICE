import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, UserPlus, Zap, Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { ErrorBanner } from '../components/common/ErrorBanner';

export default function Login() {
  const navigate = useNavigate();
  const { login, register, loginAsGuest, isLoading, error } = useAuthStore();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (authMode === 'login') {
      const res = await login(email, password);
      if (res?.success) navigate('/');
    } else {
      const res = await register(name, email, password);
      if (res?.success) navigate('/');
    }
  };

  const handleGuestLogin = async () => {
    setLocalError('');
    const res = await loginAsGuest();
    if (res?.success) navigate('/');
  };

  return (
    <div className="w-full max-w-md mx-auto py-10 px-4">
      {/* Container */}
      <div className="bg-bgAuxiliary/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-textSecondary hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Game Hub
          </Link>
          <h1 className="text-2xl font-black text-white">
            {authMode === 'login' ? 'Welcome Back!' : 'Join Pak Ludo'}
          </h1>
          <p className="text-xs text-textSecondary">
            {authMode === 'login'
              ? 'Sign in to track ratings, coins & multiplayer stats'
              : 'Create your player profile and start competing'}
          </p>
        </div>

        {/* Error Banner */}
        {(error || localError) && (
          <ErrorBanner
            message={error || localError}
            onDismiss={() => setLocalError('')}
          />
        )}

        {/* 1-Click Guest Login Button */}
        <button
          onClick={handleGuestLogin}
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-xs shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Zap size={16} />
          )}
          Instant 1-Click Guest Play
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[11px] text-textSecondary uppercase font-bold">
            Or With Account
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Social Auth */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="py-2.5 px-3 rounded-xl bg-bgDark hover:bg-stone-800 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow"
          >
            <img src="/google.svg" alt="Google" className="w-4 h-4" /> Google
          </button>
          <button
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="py-2.5 px-3 rounded-xl bg-bgDark hover:bg-stone-800 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow"
          >
            <img src="/github.svg" alt="GitHub" className="w-4 h-4 invert" /> GitHub
          </button>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-textSecondary block">
                Username / Display Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sultan_Ludo"
                  className="w-full bg-bgDark border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-textSecondary block">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="player@example.com"
                className="w-full bg-bgDark border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-textSecondary block">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bgDark border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs border border-white/10 shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : authMode === 'login' ? (
              <LogIn size={16} />
            ) : (
              <UserPlus size={16} />
            )}
            {authMode === 'login' ? 'Sign In to Account' : 'Create Account'}
          </button>
        </form>

        {/* Switch mode */}
        <div className="text-center pt-2">
          {authMode === 'login' ? (
            <p className="text-xs text-textSecondary">
              Don't have an account?{' '}
              <button
                onClick={() => setAuthMode('register')}
                className="text-green-400 font-bold hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-xs text-textSecondary">
              Already registered?{' '}
              <button
                onClick={() => setAuthMode('login')}
                className="text-green-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
