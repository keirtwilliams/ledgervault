import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Key } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // Determine redirect path based on email convention
      if (email.toLowerCase().includes('auditor')) {
        navigate('/auditor/compliance');
      } else {
        navigate('/teller/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Check your credentials and ensure your Supabase connection string is valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-emerald-500/10 rounded-full">
            <Shield className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">LedgerVault Login</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="teller@ledgervault.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-slate-900 text-white p-3 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-70"
          >
            {loading ? 'Authenticating...' : (
              <>
                <Key className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
