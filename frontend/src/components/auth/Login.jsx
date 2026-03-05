// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const getFirebaseErrorMessage = (err) => {
    if (!err || !err.code) return 'Login failed. Please try again.';
    switch (err.code) {
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      case 'auth/popup-blocked':
        return 'Popup blocked by your browser. Allow popups and try again.';
      case 'auth/popup-closed-by-user':
        return 'Popup closed before completing sign-in.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized in Firebase Auth.';
      case 'auth/operation-not-allowed':
        return 'Google sign-in is disabled in Firebase Auth.';
      default:
        return err.message || 'Login failed. Please try again.';
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/'); // redirect to home after login
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-extrabold text-2xl">B</span>
          </div>
          <h1 className="text-2xl font-extrabold text-blue-900">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to Body of Christ Centre</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
            {error}
          </div>
        )}

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all mb-5"
        >
          <FcGoogle className="text-2xl" />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-700 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

