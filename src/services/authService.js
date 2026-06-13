import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export function subscribeToAuthState(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function signIn(email, password) {
  if (!auth) throw new Error('Firebase Auth not configured');
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signOutUser() {
  if (!auth) throw new Error('Firebase Auth not configured');
  return signOut(auth);
}

export function getAuthErrorMessage(error) {
  const code = error?.code || '';
  const messages = {
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return messages[code] || error?.message || 'Login failed. Please try again.';
}
