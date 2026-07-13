import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, UserPlus } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signupWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }
    
    try {
      setError('');
      setLoading(true);
      await signupWithEmail(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create an account: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in with Google');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-neon-green/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 glass-card p-10 rounded-2xl z-10 border-t-2 border-t-neon-green/30">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
            Request Clearance
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Already have access?{' '}
            <Link to="/login" className="text-neon-green hover:text-white transition-colors">
              Log in here
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-neon-red/50 text-red-500 p-3 rounded-lg flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div className="relative">
              <Mail className="absolute top-3.5 left-3 w-5 h-5 text-gray-500" />
              <input
                type="email"
                required
                className="appearance-none relative block w-full px-10 py-3 border border-dark-700 bg-dark-900/50 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-green/50 focus:border-neon-green sm:text-sm transition-all"
                placeholder="Agent Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute top-3.5 left-3 w-5 h-5 text-gray-500" />
              <input
                type="password"
                required
                className="appearance-none relative block w-full px-10 py-3 border border-dark-700 bg-dark-900/50 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-green/50 focus:border-neon-green sm:text-sm transition-all"
                placeholder="Passphrase"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute top-3.5 left-3 w-5 h-5 text-gray-500" />
              <input
                type="password"
                required
                className="appearance-none relative block w-full px-10 py-3 border border-dark-700 bg-dark-900/50 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-green/50 focus:border-neon-green sm:text-sm transition-all"
                placeholder="Confirm Passphrase"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              disabled={loading}
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-dark-900 bg-neon-green hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-green transition-all"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Generate Credentials
            </button>
          </div>
        </form>
        
        <div className="mt-6 flex items-center justify-center">
          <div className="border-b border-dark-700 w-full"></div>
          <span className="px-4 text-gray-500 text-sm background-none">OR</span>
          <div className="border-b border-dark-700 w-full"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-dark-700 hover:bg-dark-700/80 text-white font-medium py-3 px-4 rounded-lg transition-colors border border-white/5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google Fast-Track
        </button>
      </div>
    </div>
  );
}
