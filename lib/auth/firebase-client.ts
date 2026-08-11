import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  inMemoryPersistence,
  reload,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredConfig = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
];

export function isFirebaseAuthConfigured(): boolean {
  return requiredConfig.every((value) => Boolean(value?.trim()));
}

export function getFirebaseAuth(): Auth {
  if (!isFirebaseAuthConfigured()) {
    throw new Error("Firebase authentication is not configured.");
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}

export function getFirebaseAuthDiagnostics() {
  return {
    origin: typeof window === "undefined" ? "server" : window.location.origin,
    authDomain: firebaseConfig.authDomain ?? "",
    projectId: firebaseConfig.projectId ?? "",
    apiKeyHint: firebaseConfig.apiKey
      ? `${firebaseConfig.apiKey.slice(0, 6)}...${firebaseConfig.apiKey.slice(-4)}`
      : "",
  };
}

export async function createFirebaseLoginPayload(
  email: string,
  password: string,
): Promise<{ firebaseIdToken: string }> {
  const auth = getFirebaseAuth();
  await setPersistence(auth, inMemoryPersistence);
  const credential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  await reload(credential.user);

  if (credential.user.email && !credential.user.emailVerified) {
    throw new Error("Verify your email before signing in.");
  }

  const firebaseIdToken = await credential.user.getIdToken(true);
  await signOut(auth).catch(() => undefined);

  return { firebaseIdToken };
}

export async function signOutFirebaseUser(): Promise<void> {
  if (isFirebaseAuthConfigured()) {
    await signOut(getFirebaseAuth());
  }
}
