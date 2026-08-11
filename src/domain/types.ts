export type StageId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50;
export type Direction = 'up' | 'down' | 'left' | 'right';
export type Phase = 'ready' | 'moving' | 'blocked' | 'stageClear' | 'allClear';
export interface Position { row: number; col: number }
export interface StageDefinition { id: StageId; difficulty: number; rows: number; columns: number; layout: readonly string[]; playerStart: Position; goal: Position; stars: readonly Position[] }
export interface GameState { stageId: StageId; player: Position; collectedStars: ReadonlySet<string>; phase: Phase }
export const keyOf = (p: Position) => `${p.row}:${p.col}`;
