import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

const DEMO_USERS = {
  BUYER: {
    id: 'user-buyer-1',
    name: 'Aarav Mehta',
    email: 'aarav.m@college.edu',
    college: 'National Institute of Technology',
    role: 'BUYER',
    isEmailVerified: true,
    phone: '+91 98765 43210',
    hostelRoom: 'Hostel 3, Room 214'
  },
  SELLER: {
    id: 'user-seller-1',
    name: 'Rohan Sharma',
    email: 'rohan.s@college.edu',
    college: 'National Institute of Technology',
    role: 'SELLER',
    isEmailVerified: true,
    phone: '+91 98234 56789',
    hostelRoom: 'Hostel 4, Room 108',
    upiId: 'rohan.sharma@okaxis',
    upiQrImage: null
  },
  ADMIN: {
    id: 'user-admin-1',
    name: 'Campus Moderator Prof. Rao',
    email: 'admin.moderator@college.edu',
    college: 'National Institute of Technology',
    role: 'ADMIN',
    isEmailVerified: true,
    phone: '+91 99000 11223',
    hostelRoom: 'Staff Quarters B-12',
    upiId: 'campus.moderator@okaxis',
    upiQrImage: null
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('campusloop_user');
    return saved ? JSON.parse(saved) : DEMO_USERS.BUYER;
  });

  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // Sync session on startup if backend is reachable
  useEffect(() => {
    let isMounted = true;
    const checkServerSession = async () => {
      try {
        const response = await authService.getMe();
        if (isMounted && response?.data?.user) {
          setCurrentUser(response.data.user);
        }
      } catch (err) {
        // Backend not running or no active cookie, preserve saved state
      }
    };

    checkServerSession();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('campusloop_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('campusloop_user');
    }
  }, [currentUser]);

  const switchRole = (roleKey) => {
    if (DEMO_USERS[roleKey]) {
      setCurrentUser(DEMO_USERS[roleKey]);
    } else if (roleKey === 'GUEST') {
      setCurrentUser(null);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      if (response?.data?.user) {
        setCurrentUser(response.data.user);
        return { success: true };
      }
    } catch (err) {
      // If backend is unavailable, fallback to demo mapping
      console.warn('Backend login unavailable or returned error, using local demo profile:', err.error || err.message);
      const lower = email.toLowerCase();
      if (lower.includes('admin')) {
        setCurrentUser(DEMO_USERS.ADMIN);
      } else if (lower.includes('seller') || lower.includes('rohan')) {
        setCurrentUser(DEMO_USERS.SELLER);
      } else {
        setCurrentUser({
          ...DEMO_USERS.BUYER,
          email: email,
          name: email.split('@')[0]
        });
      }
      return { success: true };
    }
  };

  const register = async ({ name, email, college, role, password }) => {
    try {
      const response = await authService.register({
        name,
        email,
        college,
        role: role === 'SELLER' ? 'SELLER' : 'BUYER',
        password: password || 'Password@123'
      });
      if (response?.data?.user) {
        setCurrentUser(response.data.user);
        return { success: true };
      }
    } catch (err) {
      // Local fallback if offline
      console.warn('Backend register unavailable, using local demo user:', err.error || err.message);
      const newUser = {
        id: 'user-' + Date.now(),
        name,
        email,
        college: college || 'National Institute of Technology',
        role: role || 'BUYER',
        isEmailVerified: false,
        phone: '',
        hostelRoom: ''
      };
      setCurrentUser(newUser);
      return { success: true };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore network errors on logout
    }
    setCurrentUser(null);
  };

  const updateProfile = (updates) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        isAuthenticated: !!currentUser,
        role: currentUser?.role || 'GUEST',
        switchRole,
        login,
        register,
        logout,
        updateProfile,
        isLoadingSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
