import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials or server error.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="glass-card p-10 border border-zinc-800 bg-[#121212] w-full max-w-md shadow-sm">
        <h2 className="text-3xl font-bold text-center mb-8 text-white tracking-tight">Welcome Back</h2>
        {error && <p className="text-red-400 bg-red-900/20 border border-red-500/30 p-3 rounded-lg mb-6 text-sm font-medium">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold mb-2 text-zinc-400 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              className="w-full p-3.5 rounded-xl bg-black border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-zinc-200 transition-all"
              value={email} onChange={(e) => setEmail(e.target.value)} required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-2 text-zinc-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full p-3.5 rounded-xl bg-black border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-zinc-200 transition-all pr-12"
                value={password} onChange={(e) => setPassword(e.target.value)} required 
              />
              <button 
                type="button" 
                className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full py-3.5 mt-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors shadow-lg">
            Sign In
          </button>
        </form>
        <p className="mt-8 text-center text-zinc-400 text-sm">
          Don't have an account? <Link to="/register" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
