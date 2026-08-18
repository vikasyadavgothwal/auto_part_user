import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import {
  getAuth,
  inMemoryPersistence,
  reload,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from "firebase/auth";

import { withBasePath } from "@/lib/routes";

declare global {
  interface Window {
    __AUTO_PARTS_FIREBASE_CONFIG__?: FirebaseOptions;
  }
}

const config: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firebaseConfig = () =>
  typeof window === "undefined"
    ? config
    : { ...config, ...window.__AUTO_PARTS_FIREBASE_CONFIG__ };

let runtimeConfigPromise: Promise<void> | null = null;

export function isFirebaseAuthConfigured(): boolean {
  const activeConfig = firebaseConfig();
  return [
    activeConfig.apiKey,
    activeConfig.authDomain,
    activeConfig.projectId,
    activeConfig.appId,
  ].every((value) => Boolean(String(value ?? "").trim()));
}

export async function ensureFirebaseAuthConfigured(): Promise<boolean> {
  if (isFirebaseAuthConfigured()) return true;
  if (typeof window === "undefined") return false;

  runtimeConfigPromise ??= new Promise<void>((resolve) => {
    const script = document.createElement("script");
    script.src = `${withBasePath("/api/firebase-config.js")}?ts=${Date.now()}`;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });

  await runtimeConfigPromise;
  return isFirebaseAuthConfigured();
}

export function getFirebaseAuth(): Auth {
  if (!isFirebaseAuthConfigured()) {
    throw new Error("Firebase authentication is not configured.");
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig());
  return getAuth(app);
}

export function getFirebaseAuthDiagnostics() {
  const activeConfig = firebaseConfig();
  const apiKey = String(activeConfig.apiKey ?? "");
  return {
    origin: typeof window === "undefined" ? "server" : window.location.origin,
    authDomain: String(activeConfig.authDomain ?? ""),
    projectId: String(activeConfig.projectId ?? ""),
    apiKeyHint: apiKey ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : "",
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
