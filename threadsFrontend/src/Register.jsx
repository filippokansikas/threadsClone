import React, { useState } from 'react';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, profilePicture, bio }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Registration successful! You can now log in.');
        setUsername(''); setPassword(''); setConfirm(''); setEmail(''); setProfilePicture(''); setBio('');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-white text-center mb-2">Create your account</h2>
        {error && <div className="text-red-400 text-center">{error}</div>}
        {success && <div className="text-green-400 text-center">{success}</div>}
        <input
          type="text"
          className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 text-base placeholder-neutral-500"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoFocus
        />
        <input
          type="email"
          className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 text-base placeholder-neutral-500"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 text-base placeholder-neutral-500"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <input
          type="password"
          className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 text-base placeholder-neutral-500"
          placeholder="Confirm Password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
        />
        <input
          type="text"
          className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 text-base placeholder-neutral-500"
          placeholder="Profile Picture URL (optional)"
          value={profilePicture}
          onChange={e => setProfilePicture(e.target.value)}
        />
        <input
          type="text"
          className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 text-base placeholder-neutral-500"
          placeholder="Bio (optional)"
          value={bio}
          onChange={e => setBio(e.target.value)}
        />
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-white text-neutral-900 font-semibold hover:bg-neutral-200 transition mt-2"
          disabled={!username || !email || !password || password !== confirm}
        >
          Register
        </button>
        <div className="text-center text-neutral-400 text-sm mt-2">
          Already have an account? <a href="/login" className="text-blue-400 hover:underline">Login</a>
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

export default Register; 