import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Login successful!');
        // Store token and user info in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect to profile page
        setTimeout(() => navigate('/profile'), 500);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-white text-center mb-2">Sign in to Threads</h2>
        {error && <div className="text-red-400 text-center">{error}</div>}
        {success && <div className="text-green-400 text-center">{success}</div>}
        <input
          type="email"
          className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 text-base placeholder-neutral-500"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 text-base placeholder-neutral-500"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-white text-neutral-900 font-semibold hover:bg-neutral-200 transition mt-2"
        >
          Login
        </button>
        <div className="text-center text-neutral-400 text-sm mt-2">
          Don't have an account? <a href="/register" className="text-blue-400 hover:underline">Register</a>
        </div>
      </form>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease; }
      `}</style>
    </div>
  );
}

export default Login; 