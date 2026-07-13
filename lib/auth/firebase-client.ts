import { getApp, getApps, initializeApp } from "firebase/app"
import {
  getAuth,
  reload,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const requiredConfig = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
]

export function isFirebaseAuthConfigured(): boolean {
  return requiredConfig.every((value) => Boolean(value?.trim()))
}

function getFirebaseAuth(): Auth {
  if (!isFirebaseAuthConfigured()) {
    throw new Error("Firebase authentication is not configured.")
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  return getAuth(app)
}

export async function createFirebaseLoginPayload(
  email: string,
  password: string,
): Promise<{ firebaseIdToken: string; installationId: string }> {
  const credential = await signInWithEmailAndPassword(
    getFirebaseAuth(),
    email,
    password,
  )
  await reload(credential.user)

  if (credential.user.email && !credential.user.emailVerified) {
    throw new Error("Verify your email before signing in.")
  }

  const installationKey = "auto-parts-pro-installation-id"
  let installationId = window.localStorage.getItem(installationKey)
  if (!installationId) {
    installationId = crypto.randomUUID()
    window.localStorage.setItem(installationKey, installationId)
  }

  return {
    firebaseIdToken: await credential.user.getIdToken(true),
    installationId,
  }
}

export async function signOutFirebaseUser(): Promise<void> {
  if (isFirebaseAuthConfigured()) {
    await signOut(getFirebaseAuth())
  }
}
