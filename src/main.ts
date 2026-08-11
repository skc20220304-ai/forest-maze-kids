import Phaser from 'phaser';
import './styles.css';
import './parent.css';
import type { Direction, GameState } from './domain/types';
import { getActiveSlotId, loadLocalSlots, loadLocalProgress, saveLocalProgress, saveLocalSlots, setActiveSlotId, type SaveSlot } from './persistence/localProgress';
import { firebaseEnabled, auth, signIn, signUp, saveCloudSlots, syncSlots, watchUser } from './persistence/cloudProgress';
import { GameScene } from './game/GameScene';
import { stages } from './stages/stages';

const stars = document.querySelector('#stars')!;
const stageLabel = document.querySelector('#stage')!;
const overlay = document.querySelector('#overlay') as HTMLElement;
const title = document.querySelector('#overlay-title')!;
const next = document.querySelector('#next') as HTMLButtonElement;
const picker = document.querySelector('#save-picker') as HTMLElement;
const slotsElement = document.querySelector('#save-slots') as HTMLElement;
const nameForm = document.querySelector('#save-name-form') as HTMLElement;
const nameInput = document.querySelector('#save-name') as HTMLInputElement;
const stagePicker = document.querySelector('#stage-picker') as HTMLElement;
const stageList = document.querySelector('#stage-list') as HTMLElement;
const activeSlotId = { value: getActiveSlotId() };
let editingSlotId: string | null = null;
let current: GameState | null = null;

const game = new Phaser.Game({ type: Phaser.CANVAS, parent: 'game-container', backgroundColor: '#eaf6d8', scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 540, height: 540 }, scene: [GameScene], render: { antialias: true, pixelArt: false } });

const emitMove = (direction: Direction) => document.dispatchEvent(new CustomEvent('maze:move', { detail: direction }));
document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach((button) => {
  button.addEventListener('pointerdown', (event) => { event.preventDefault(); button.classList.add('pressed'); emitMove(button.dataset.direction as Direction); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((name) => button.addEventListener(name, () => button.classList.remove('pressed')));
});
document.addEventListener('keydown', (event) => { if (event.repeat) return; const map: Record<string, Direction> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }; if (map[event.key]) { event.preventDefault(); emitMove(map[event.key]); } });

const chooseSlot = (slot: SaveSlot) => {
  activeSlotId.value = slot.id;
  setActiveSlotId(slot.id);
  picker.hidden = true;
  nameForm.hidden = true;
  (game.scene.getScene('game') as GameScene).loadStage(slot.highestStage);
};

const openNameForm = (slotId: string) => {
  editingSlotId = slotId;
  const slot = loadLocalSlots().find((item) => item.id === slotId);
  nameInput.value = slot?.name ?? '';
  nameForm.hidden = false;
  nameInput.focus();
};

const renderSaveSlots = (slots: SaveSlot[]) => {
  slotsElement.replaceChildren();
  slots.forEach((slot) => {
    const row = document.createElement('div');
    row.className = 'save-slot-row';
    const select = document.createElement('button');
    select.type = 'button';
    select.className = 'save-slot';
    select.textContent = slot.name ? `${slot.name}　ステージ ${slot.highestStage}` : '＋ あたらしいデータ';
    select.addEventListener('click', () => slot.name ? chooseSlot(slot) : openNameForm(slot.id));
    row.append(select);
    if (slot.name) {
      const rename = document.createElement('button');
      rename.type = 'button';
      rename.className = 'rename-slot';
      rename.textContent = 'なまえをかえる';
      rename.addEventListener('click', () => openNameForm(slot.id));
      row.append(rename);
    }
    slotsElement.append(row);
  });
};

document.querySelector('#save-name-ok')!.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (!editingSlotId || !name) { nameInput.focus(); return; }
  const slots = loadLocalSlots();
  const slot = slots.find((item) => item.id === editingSlotId);
  if (!slot) return;
  slot.name = name.slice(0, 24);
  slot.updatedAt = new Date().toISOString();
  saveLocalSlots(slots);
  void saveCloudSlots(slots);
  renderSaveSlots(slots);
  nameForm.hidden = true;
  chooseSlot(slot);
  editingSlotId = null;
});
document.querySelector('#save-name-cancel')!.addEventListener('click', () => { nameForm.hidden = true; editingSlotId = null; });

const renderStagePicker = () => {
  const selected = loadLocalSlots().find((slot) => slot.id === activeSlotId.value);
  const highestStage = selected?.highestStage ?? 1;
  stageList.replaceChildren();
  stages.forEach((stage) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'stage-choice';
    button.disabled = stage.id > highestStage;
    button.textContent = stage.id <= highestStage ? `ステージ ${stage.id}` : `🔒 ステージ ${stage.id}`;
    button.addEventListener('click', () => { stagePicker.hidden = true; overlay.hidden = true; (game.scene.getScene('game') as GameScene).loadStage(stage.id); });
    stageList.append(button);
  });
};
document.querySelector('#stage-select')!.addEventListener('click', () => { renderStagePicker(); stagePicker.hidden = false; });
document.querySelector('#close-stage-picker')!.addEventListener('click', () => { stagePicker.hidden = true; });

document.querySelector('#reset')!.addEventListener('click', () => { overlay.hidden = true; document.dispatchEvent(new Event('maze:reset')); });
document.addEventListener('maze:state', (event) => {
  current = (event as CustomEvent<GameState>).detail;
  const total = stages.find((stage) => stage.id === current!.stageId)?.stars.length ?? 3;
  stars.textContent = `⭐ ${current.collectedStars.size} / ${total}`;
  stageLabel.textContent = `ステージ ${current.stageId}`;
  if (current.phase === 'stageClear') {
    saveLocalProgress(current.stageId, activeSlotId.value ?? undefined);
    void saveCloudSlots(loadLocalSlots());
    overlay.hidden = false;
    title.textContent = current.stageId === 10 ? '🎉 ぜんぶクリア！ ✨' : '🎉 やったー！ ✨';
    next.hidden = current.stageId === 10;
  }
});
next.addEventListener('click', () => { if (!current || current.stageId >= 10) return; saveLocalProgress(current.stageId + 1, activeSlotId.value ?? undefined); overlay.hidden = true; (game.scene.getScene('game') as GameScene).loadStage(current.stageId + 1); });

renderSaveSlots(loadLocalSlots());
const syncOnLogin = async () => {
  if (!auth?.currentUser) return;
  const slots = await syncSlots(loadLocalSlots());
  saveLocalSlots(slots);
  renderSaveSlots(slots);
  const selected = slots.find((slot) => slot.id === activeSlotId.value);
  if (selected) (game.scene.getScene('game') as GameScene).loadStage(selected.highestStage);
};
watchUser((user) => { if (user) void syncOnLogin(); });

const parentPanel = document.querySelector('#parent-panel') as HTMLElement;
document.querySelector('#parent')!.addEventListener('click', () => { parentPanel.hidden = false; });
document.querySelector('#close-parent')!.addEventListener('click', () => { parentPanel.hidden = true; });
const email = document.querySelector('#email') as HTMLInputElement;
const password = document.querySelector('#password') as HTMLInputElement;
const status = document.querySelector('#auth-status')!;
const authAction = async (action: 'signIn' | 'signUp') => { const result = action === 'signIn' ? await signIn(email.value, password.value) : await signUp(email.value, password.value); status.textContent = result.message; if (result.ok) parentPanel.hidden = true; };
document.querySelector('#sign-in')!.addEventListener('click', () => void authAction('signIn'));
document.querySelector('#sign-up')!.addEventListener('click', () => void authAction('signUp'));
if (!firebaseEnabled) status.textContent = 'Firebase未設定です。端末内には保存されます。';
