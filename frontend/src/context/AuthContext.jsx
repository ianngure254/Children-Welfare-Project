
import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase/config';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  // ========== CREATE MONGODB USER RECORD ==========
  const createMongoDBUser = async (firebaseUser, firstName = '', lastName = '') => {
    try {
      let first = firstName;
      let last = lastName;

      if (!first && firebaseUser.displayName) {
        const parts = firebaseUser.displayName.trim().split(/\s+/);
        first = parts[0] || 'User';
        last = parts.slice(1).join(' ') || '';
      }

      const mongoUser = {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        firstName: first || 'User',
        lastName: last || '',
        password: 'firebase-auth',
        role: 'user',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Kenya'
        },
        profileImage: firebaseUser.photoURL || '',
        isActive: true,
        isEmailVerified: true
      };

      const res = await fetch(`${API}/users/create-from-firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mongoUser)
      });

      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json() : await res.text();

      if (!res.ok) {
        console.error(`MongoDB creation failed (${res.status}):`, data.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating MongoDB user:', error.message);
      return false;
    }
  };

  // ========== FETCH USER ROLE ==========
  const fetchUserRole = async (user) => {
    const activeUid = user?.uid;
    try {
      console.log(`🔍 Fetching role for: ${user.email}`);
      
      const email = user.email;
      if (!email) {
        console.warn('⚠️ No email found in Firebase user');
        setRole('user');
        setLoading(false);
        return;
      }

      // Try sync endpoint first
      try {
        const token = await user.getIdToken();
        console.log('📡 Attempting sync endpoint...');
        
        const syncRes = await fetch(`${API}/users/sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        console.log(`📥 Sync response status: ${syncRes.status}`);

        if (syncRes.ok) {
          const syncPayload = await syncRes.json();
          if (auth.currentUser?.uid !== activeUid) {
            console.log('⚠️ Auth changed, ignoring stale response');
            return;
          }
          const userRole = syncPayload?.data?.role || 'student';
          setRole(userRole);
          console.log(`✅ User role synced: ${userRole}`);
          setLoading(false);
          return;
        } else {
          console.warn(`⚠️ Sync failed with status: ${syncRes.status}`);
          const ct = syncRes.headers.get('content-type') || '';
          const errorData = ct.includes('application/json') ? await syncRes.json() : await syncRes.text();
          console.warn('⚠️ Sync error:', errorData);
        }
      } catch (syncErr) {
        console.warn('⚠️ Sync error:', syncErr.message);
      }

      // Fallback: lookup by email
      console.log('📡 Attempting email lookup...');
      const encodedEmail = encodeURIComponent(email);
      const res = await fetch(`${API}/users/email/${encodedEmail}`);

      console.log(`📥 Email lookup response status: ${res.status}`);

      if (!res.ok) {
        console.warn(`⚠️ User not found (${res.status}): ${email}`);
        console.log('💡 This is normal if user just signed up - role will default to "user"');
        setRole('user');
        setLoading(false);
        return;
      }

      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        console.warn('⚠️ Expected JSON response, got:', ct);
        setRole('user');
        setLoading(false);
        return;
      }

      const payload = await res.json();
      
      if (auth.currentUser?.uid !== activeUid) {
        console.log('⚠️ Auth changed, ignoring stale response');
        return;
      }

      const userRole = payload?.data?.role || 'user';
      setRole(userRole);
      console.log(`✅ User role loaded: ${userRole}`);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching user role:', error);
      setRole('user');
      setLoading(false);
    }
  };

  // ========== SIGN UP ==========
  const signup = async (email, password, displayName, firstName = '', lastName = '') => {
    try {
      console.log('📝 Starting signup process for:', email);

      // 1. Create Firebase account
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Firebase account created');

      // 2. Update Firebase profile
      if (displayName) {
        await updateProfile(result.user, { displayName });
        console.log('✅ Firebase profile updated');
      }

      // 3. Create MongoDB user record with detailed logging
      console.log('⏳ Creating MongoDB record...');
      const mongoCreated = await createMongoDBUser(result.user, firstName, lastName);
      
      if (!mongoCreated) {
        console.warn('⚠️ MongoDB creation failed, but signup continues');
      }

      return result;
    } catch (error) {
      console.error('❌ Signup error:', error.message);
      throw error;
    }
  };

  // Login with email & password
  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      console.log('🔐 Starting Google login...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Google login successful:', result.user.email);

      try {
        const checkUser = await fetch(`${API}/users/firebase/${result.user.uid}`);

        if (!checkUser.ok) {
          console.log('👤 New Google user - creating MongoDB record');
          await createMongoDBUser(result.user);
        } else {
          console.log('✅ Existing Google user');
        }
      } catch (checkError) {
        console.warn('⚠️ Could not verify user:', checkError.message);
      }

      return result;
    } catch (error) {
      console.error('❌ Google login error:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      console.log('🔄 Logging out...');

      setCurrentUser(null);
      setRole(null);
      setLoading(false);

      localStorage.clear();
      sessionStorage.clear();

      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });

      await signOut(auth);

      console.log('✅ Logout complete');
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ Logout error:', error);
      setCurrentUser(null);
      setRole(null);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  // Auth state listener
  useEffect(() => {
    console.log('🚀 Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('📡 Auth state changed:', user ? user.email : 'logged out');
      
      setCurrentUser(user);
      setRole(null);

      if (user) {
        console.log(`✅ User logged in: ${user.email}`);
        setLoading(true);
        fetchUserRole(user);
      } else {
        console.log('🔓 User logged out');
        setRole(null);
        setLoading(false);
        localStorage.clear();
        sessionStorage.clear();
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    role,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
