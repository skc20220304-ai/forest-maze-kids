export const MAX_SAVE_SLOTS = 3;
export interface SaveSlot {
  id: string;
  name: string;
  highestStage: number;
  updatedAt?: string;
}

const SLOTS_KEY = 'forest-maze:save-slots';
const ACTIVE_SLOT_KEY = 'forest-maze:active-slot';
const LEGACY_STAGE_KEY = 'forest-maze:stage';

const clampStage = (value: unknown) => {
  const stage = Number(value);
  return Number.isInteger(stage) && stage >= 1 && stage <= 10 ? stage : 1;
};

export function emptySaveSlots(): SaveSlot[] {
  return Array.from({ length: MAX_SAVE_SLOTS }, (_, index) => ({ id: `slot-${index + 1}`, name: '', highestStage: 1 }));
}

export function normalizeSaveSlots(value: unknown): SaveSlot[] {
  const source = Array.isArray(value) ? value : [];
  return emptySaveSlots().map((slot, index) => {
    const candidate = source[index] as Partial<SaveSlot> | undefined;
    return {
      id: slot.id,
      name: typeof candidate?.name === 'string' ? candidate.name.trim().slice(0, 24) : '',
      highestStage: clampStage(candidate?.highestStage),
      updatedAt: typeof candidate?.updatedAt === 'string' ? candidate.updatedAt : undefined,
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
