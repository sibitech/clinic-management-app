// src/context/AuthContext.jsx - Authentication context provider
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { checkUserAccess } from '../api/userApi';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Auth successful, but we still need to check the allowlist
      return result.user;
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  };

  // Sign out
  const signOut = () => {
    return firebaseSignOut(auth);
  };

  // Listen for auth state changes and check if user is in allowlist
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          // Check if user's email is in the allowlist
          const isAllowed = await checkUserAccess(authUser.email);
          
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
            isAllowed
          });
        } catch (error) {
          console.error("Error checking user access:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
