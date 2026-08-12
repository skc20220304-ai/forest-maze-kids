export type StageId = number;
export type Direction = 'up' | 'down' | 'left' | 'right';
export type Phase = 'ready' | 'moving' | 'blocked' | 'stageClear' | 'allClear';
export interface Position { row: number; col: number }
export interface StageDefinition { id: StageId; difficulty: number; rows: number; columns: number; layout: readonly string[]; playerStart: Position; goal: Position; stars: readonly Position[] }
export interface GameState { stageId: StageId; player: Position; collectedStars: ReadonlySet<string>; phase: Phase }
export const keyOf = (p: Position) => `${p.row}:${p.col}`;
