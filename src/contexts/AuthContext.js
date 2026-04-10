'use client'
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth State Changed. User:", user?.email);
      if (user) {
        setUser(user);
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            console.log("Profile Found:", docSnap.data().role);
            setProfile(docSnap.data());
          } else {
            console.warn("No Firestore profile for user:", user.uid);
          }
        } catch (err) {
          console.error("Firestore Error:", err);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  
  const logout = () => signOut(auth);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const signup = async (email, password, fullName, role, mentorId = null) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    // Create profile in Firestore
    const profileData = {
      uid: user.uid,
      full_name: fullName,
      email: email,
      role: role,
      mentor_id: mentorId,
      created_at: new Date().toISOString()
    };

    await setDoc(doc(db, "users", user.uid), profileData);
    setProfile(profileData);
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, profile, login, logout, signup, resetPassword, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
