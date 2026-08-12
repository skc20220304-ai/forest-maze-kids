export const MAX_SAVE_SLOTS = 3;
export interface StageScore { stars: number; bestTimeMs: number; completedAt?: string }
export interface SaveSlot {
  id: string;
  name: string;
  highestStage: number;
  scores: Record<string, StageScore>;
  updatedAt?: string;
}

const SLOTS_KEY = 'forest-maze:save-slots';
const ACTIVE_SLOT_KEY = 'forest-maze:active-slot';
const LEGACY_STAGE_KEY = 'forest-maze:stage';

const clampStage = (value: unknown) => {
  const stage = Number(value);
  return Number.isInteger(stage) && stage >= 1 && stage <= 150 ? stage : 1;
};

export function emptySaveSlots(): SaveSlot[] {
  return Array.from({ length: MAX_SAVE_SLOTS }, (_, index) => ({ id: `slot-${index + 1}`, name: '', highestStage: 1, scores: {} }));
}

function normalizeScores(value: unknown): Record<string, StageScore> {
  if (!value || typeof value !== 'object') return {};
  return Object.entries(value as Record<string, unknown>).reduce<Record<string, StageScore>>((scores, [stageId, raw]) => {
    const stage = clampStage(stageId);
    if (String(stage) !== stageId) return scores;
    const candidate = raw as Partial<StageScore>;
    const stars = Number(candidate?.stars);
    const bestTimeMs = Number(candidate?.bestTimeMs);
    if (!Number.isInteger(stars) || stars < 0 || stars > 3 || !Number.isFinite(bestTimeMs) || bestTimeMs < 0) return scores;
    scores[stageId] = { stars, bestTimeMs: Math.round(bestTimeMs), ...(typeof candidate?.completedAt === 'string' ? { completedAt: candidate.completedAt } : {}) };
    return scores;
  }, {});
}

export function normalizeSaveSlots(value: unknown): SaveSlot[] {
  const source = Array.isArray(value) ? value : [];
  return emptySaveSlots().map((slot, index) => {
    const candidate = source[index] as Partial<SaveSlot> | undefined;
    const updatedAt = typeof candidate?.updatedAt === 'string' ? candidate.updatedAt : undefined;
    const scores = normalizeScores(candidate?.scores);
    return {
      id: slot.id,
      name: typeof candidate?.name === 'string' ? candidate.name.trim().slice(0, 24) : '',
      highestStage: Math.max(clampStage(candidate?.highestStage), scores['100'] ? 101 : scores['50'] ? 51 : 1),
      scores,
      ...(updatedAt ? { updatedAt } : {}),
    };
  });
}

export function loadLocalSlots(): SaveSlot[] {
  try {
    const raw = localStorage.getItem(SLOTS_KEY);
    if (raw) return normalizeSaveSlots(JSON.parse(raw));
  } catch {
    // Continue with a clean local save when old/corrupt data is found.
  }
  const legacyStage = localStorage.getItem(LEGACY_STAGE_KEY);
  const slots = emptySaveSlots();
  if (legacyStage) {
    slots[0].name = 'データ1';
    slots[0].highestStage = clampStage(legacyStage);
  }
  saveLocalSlots(slots);
  return slots;
}

export function saveLocalSlots(slots: SaveSlot[]) {
  localStorage.setItem(SLOTS_KEY, JSON.stringify(normalizeSaveSlots(slots)));
}

export function getActiveSlotId() {
  const id = localStorage.getItem(ACTIVE_SLOT_KEY);
  return id && /^slot-[1-3]$/.test(id) ? id : null;
}

export function setActiveSlotId(id: string) {
  localStorage.setItem(ACTIVE_SLOT_KEY, id);
}

export function loadLocalProgress(slotId = getActiveSlotId() ?? 'slot-1') {
  return loadLocalSlots().find((slot) => slot.id === slotId)?.highestStage ?? 1;
}

export function saveLocalProgress(stage: number, slotId = getActiveSlotId() ?? 'slot-1') {
  const slots = loadLocalSlots();
  const slot = slots.find((item) => item.id === slotId);
  if (slot) {
    slot.highestStage = Math.max(slot.highestStage, clampStage(stage));
    slot.updatedAt = new Date().toISOString();
    saveLocalSlots(slots);
  }
}

export function saveStageScore(stage: number, stars: number, elapsedMs: number, slotId = getActiveSlotId() ?? 'slot-1') {
  const slots = loadLocalSlots();
  const slot = slots.find((item) => item.id === slotId);
  if (!slot) return;
  const stageId = String(clampStage(stage));
  const current = slot.scores[stageId];
  const nextStars = Math.max(current?.stars ?? 0, Math.max(0, Math.min(3, Math.round(stars))));
  const roundedTime = Math.max(0, Math.round(elapsedMs));
  const bestTimeMs = current ? Math.min(current.bestTimeMs, roundedTime) : roundedTime;
  slot.scores[stageId] = { stars: nextStars, bestTimeMs, completedAt: new Date().toISOString() };
  slot.updatedAt = new Date().toISOString();
  saveLocalSlots(slots);
}

export function deleteSaveSlot(slotId: string) {
  const slots = loadLocalSlots();
  const index = slots.findIndex((slot) => slot.id === slotId);
  if (index < 0) return slots;
  const replacement = emptySaveSlots()[index];
  replacement.updatedAt = new Date().toISOString();
  slots[index] = replacement;
  if (getActiveSlotId() === slotId) localStorage.removeItem(ACTIVE_SLOT_KEY);
  saveLocalSlots(slots);
  return slots;
}
