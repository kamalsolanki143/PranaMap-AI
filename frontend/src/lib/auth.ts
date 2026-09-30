import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import type { User as FirebaseUser, AuthError } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

/**
 * Human-readable mapping of Firebase Auth error codes.
 * Ensures no internal raw stack traces or obscure codes are exposed to users.
 */
export function getAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.';
  const code = (error as AuthError)?.code || '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please verify your credentials.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters with a combination of letters and numbers.';
    case 'auth/invalid-email':
      return 'Please enter a valid official or personal email address.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in window was closed before completion. Please try again.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this domain.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Access temporarily disabled due to multiple failed attempts. Please reset your password or try again later.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is currently not enabled in Firebase Console. Please contact platform administrators.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Console Authentication settings.';
    case 'auth/user-disabled':
      return 'This user account has been deactivated. Please contact your environmental agency administrator.';
    default:
      return error.message || 'Authentication failed. Please verify your credentials and try again.';
  }
}

/**
 * Sign in with email and password
 */
export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return result.user;
}

/**
 * Register with email, password, and optional full name & organization metadata
 */
export async function registerWithEmail(
  email: string,
  pass: string,
  fullName?: string
): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (fullName && result.user) {
    await updateProfile(result.user, {
      displayName: fullName.trim(),
    });
  }
  return result.user;
}

/**
 * Sign in with Google (popup with graceful error handling)
 */
export async function loginWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Send password reset email
 */
export async function sendResetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Sign out
 */
export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}
