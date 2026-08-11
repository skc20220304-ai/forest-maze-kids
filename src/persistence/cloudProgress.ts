import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, type User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const env = import.meta.env;
const config = { apiKey: env.VITE_FIREBASE_API_KEY, authDomain: env.VITE_FIREBASE_AUTH_DOMAIN, projectId: env.VITE_FIREBASE_PROJECT_ID, storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET, messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID, appId: env.VITE_FIREBASE_APP_ID };
export const firebaseEnabled = Object.values(config).every(Boolean);
const app = firebaseEnabled ? (getApps()[0] ?? initializeApp(config)) : null;
export const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

export async function signIn(email: string, password: string) { if (!auth) return { ok: false, message: 'Firebase未設定です。' }; try { await signInWithEmailAndPassword(auth, email, password); return { ok: true, message: 'ログインしました。' }; } catch { return { ok: false, message: 'メールアドレスまたはパスワードを確認してください。' }; } }
export async function signUp(email: string, password: string) { if (!auth) return { ok: false, message: 'Firebase未設定です。' }; try { await createUserWithEmailAndPassword(auth, email, password); return { ok: true, message: 'アカウントを作成しました。' }; } catch { return { ok: false, message: '登録できません。メールアドレスと6文字以上のパスワードを確認してください。' }; } }
export function watchUser(callback: (user: User | null) => void) { if (auth) return onAuthStateChanged(auth, callback); callback(null); return () => undefined; }
export async function loadCloudProgress() { if (!db || !auth?.currentUser) return null; const snapshot = await getDoc(doc(db, 'game_progress', auth.currentUser.uid)); return snapshot.exists() ? Number(snapshot.data().highestStage ?? 1) : null; }
export async function saveCloudProgress(stage: number) { if (!db || !auth?.currentUser) return false; await setDoc(doc(db, 'game_progress', auth.currentUser.uid), { highestStage: stage, updatedAt: new Date().toISOString() }, { merge: true }); return true; }
export async function syncProgress(localStage: number) { const remote = await loadCloudProgress(); const stage = Math.max(localStage, remote ?? 1); return { stage, synced: await saveCloudProgress(stage) }; }
