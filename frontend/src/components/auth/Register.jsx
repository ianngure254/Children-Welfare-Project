// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation before calling Firebase
    if (password !== confirm) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    try {
      await signup(email, password, name);

      // Create user record in backend for role lookup
      const [firstName, ...rest] = name.trim().split(/\s+/);
      const lastName = rest.join(' ') || 'User';
      try {
        const res = await fetch(`${API}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            firstName,
            lastName,
          }),
        });
        if (!res.ok) {
          console.warn('Backend user register failed:', res.status);
        }
      } catch (err) {
        console.warn('Backend user register failed:', err);
      }

      navigate('/');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('An account with this email already exists.');
      else if (err.code === 'auth/invalid-email') setError('Invalid email address.');
      else setError('Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const handleGoogleRegister = async () => {
    try {
      await loginWithGoogle();
      navigate('/');
    } catch {
      setError('Google sign-in failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-extrabold text-2xl">B</span>
          </div>
          <h1 className="text-2xl font-extrabold text-blue-900">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join Body of Christ Centre</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleRegister}
          className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-all mb-5"
        >
          <FcGoogle className="text-2xl" />
          Sign up with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Your full name" required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com" required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters" required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password" required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-700 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

