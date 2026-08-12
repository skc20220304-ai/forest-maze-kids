import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, type User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { emptySaveSlots, normalizeSaveSlots, type SaveSlot, type StageScore } from './localProgress';

const env = import.meta.env;
const config = { apiKey: env.VITE_FIREBASE_API_KEY, authDomain: env.VITE_FIREBASE_AUTH_DOMAIN, projectId: env.VITE_FIREBASE_PROJECT_ID, storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET, messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID, appId: env.VITE_FIREBASE_APP_ID };
export const firebaseEnabled = Object.values(config).every(Boolean);
const app = firebaseEnabled ? (getApps()[0] ?? initializeApp(config)) : null;
export const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

export async function signIn(email: string, password: string) { if (!auth) return { ok: false, message: 'Firebase未設定です。' }; try { await signInWithEmailAndPassword(auth, email, password); return { ok: true, message: 'ログインしました。' }; } catch { return { ok: false, message: 'メールアドレスまたはパスワードを確認してください。' }; } }
export async function signUp(email: string, password: string) { if (!auth) return { ok: false, message: 'Firebase未設定です。' }; try { await createUserWithEmailAndPassword(auth, email, password); return { ok: true, message: 'アカウントを作成しました。' }; } catch { return { ok: false, message: '登録できません。メールアドレスと6文字以上のパスワードを確認してください。' }; } }
export function watchUser(callback: (user: User | null) => void) { if (auth) return onAuthStateChanged(auth, callback); callback(null); return () => undefined; }

export async function loadCloudSlots(): Promise<SaveSlot[] | null> {
  if (!db || !auth?.currentUser) return null;
  const snapshot = await getDoc(doc(db, 'game_progress', auth.currentUser.uid));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  if (data.slots) return normalizeSaveSlots(Object.values(data.slots));
  const slots = emptySaveSlots();
  if (Number.isInteger(data.highestStage)) { slots[0].name = 'データ1'; slots[0].highestStage = Math.max(1, Math.min(150, Number(data.highestStage))); }
  return slots;
}

export async function saveCloudSlots(slots: SaveSlot[]) {
  if (!db || !auth?.currentUser) return false;
  const normalized = normalizeSaveSlots(slots);
  const record = Object.fromEntries(normalized.map((slot) => [slot.id, slot]));
  await setDoc(doc(db, 'game_progress', auth.currentUser.uid), { slots: record, updatedAt: new Date().toISOString() });
  return true;
}

export async function syncSlots(localSlots: SaveSlot[]) {
  const remoteSlots = await loadCloudSlots();
  if (!remoteSlots) { await saveCloudSlots(localSlots); return normalizeSaveSlots(localSlots); }
  const mergeScores = (local: Record<string, StageScore>, remote: Record<string, StageScore>) => {
    const keys = new Set([...Object.keys(local), ...Object.keys(remote)]);
    return Object.fromEntries([...keys].map((key) => {
      const left = local[key]; const right = remote[key];
      if (!left) return [key, right]; if (!right) return [key, left];
      return [key, { stars: Math.max(left.stars, right.stars), bestTimeMs: Math.min(left.bestTimeMs, right.bestTimeMs), completedAt: left.completedAt && right.completedAt ? (left.completedAt > right.completedAt ? left.completedAt : right.completedAt) : left.completedAt ?? right.completedAt }];
    }));
  };
  const merged = normalizeSaveSlots(localSlots).map((local, index) => {
    const remote = remoteSlots[index];
    const localIsNewer = (local.updatedAt ?? '') >= (remote.updatedAt ?? '');
    if (!local.name && localIsNewer) return local;
    if (!remote.name && !localIsNewer) return remote;
    return { ...local, name: remote.name || local.name, highestStage: Math.max(local.highestStage, remote.highestStage), scores: mergeScores(local.scores, remote.scores), updatedAt: remote.updatedAt ?? local.updatedAt };
  });
  await saveCloudSlots(merged);
  return merged;
}
