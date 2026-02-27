import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header, Footer } from '../components/Layout';
import { Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">Welcome Back</h1>
            <p className="text-slate-500 mt-2">Sign in to manage your pet shop</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2ec2b3] outline-none transition-all"
                  placeholder="admin@petshop.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2ec2b3] outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

            <button 
              type="submit"
              className="w-full bg-[#2ec2b3] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#2ec2b3]/20 hover:brightness-105 active:scale-[0.98] transition-all"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Admin Demo: <span className="font-bold text-[#2ec2b3]">admin@petshop.com</span> / <span className="font-bold text-[#2ec2b3]">admin123</span>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
