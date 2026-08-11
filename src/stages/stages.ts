import type { StageDefinition, StageId, Position } from '../domain/types';
import { validateStage } from '../domain/maze';

const starterStages: StageDefinition[] = [
 {id:1,rows:5,columns:5,layout:['S....','.##..','...#.','.#...','....G'],playerStart:{row:0,col:0},goal:{row:4,col:4},stars:[{row:0,col:2}]},
 {id:2,rows:6,columns:6,layout:['S.....','.##...','...#..','.##...','....#.','.....G'],playerStart:{row:0,col:0},goal:{row:5,col:5},stars:[{row:0,col:2},{row:4,col:2}]},
 {id:3,rows:7,columns:7,layout:['S......','.##....','...#...','.###...','.......','..##...','......G'],playerStart:{row:0,col:0},goal:{row:6,col:6},stars:[{row:0,col:2},{row:2,col:5},{row:6,col:2}]},
 {id:4,rows:8,columns:8,layout:['S...#...','.##.#.##','...#....','##.#.###','...#....','.###.##.','...#...G','........'],playerStart:{row:0,col:0},goal:{row:6,col:7},stars:[{row:0,col:2},{row:2,col:6},{row:7,col:3}]},
 {id:5,rows:9,columns:9,layout:['S...#....','.##.#.###','...#.....','##.###.#.','...#...#.','.#.###.#.','.#.....#.','.#####...','........G'],playerStart:{row:0,col:0},goal:{row:8,col:8},stars:[{row:0,col:2},{row:2,col:6},{row:8,col:3}]},
];

// Deterministic depth-first mazes keep later stages varied while remaining reproducible.
function makeChallengeStage(id: StageId, size: number): StageDefinition {
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => '#'));
  let seed = id * 7919 + size * 104729;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0x100000000; };
  const start = { row: 1, col: 1 };
  const stack: Position[] = [start];
  grid[start.row][start.col] = '.';
  const directions = [[-2,0],[2,0],[0,-2],[0,2]] as const;
  while (stack.length) {
    const current = stack[stack.length - 1];
    const options = directions
      .map(([dr, dc]) => ({ dr, dc, row: current.row + dr, col: current.col + dc }))
      .filter(next => next.row > 0 && next.row < size - 1 && next.col > 0 && next.col < size - 1 && grid[next.row][next.col] === '#')
      .sort(() => random() - 0.5);
    if (!options.length) { stack.pop(); continue; }
    const next = options[0];
    grid[current.row + next.dr / 2][current.col + next.dc / 2] = '.';
    grid[next.row][next.col] = '.';
    stack.push({ row: next.row, col: next.col });
  }
  const goal = { row: size - 2, col: size - 2 };
  grid[start.row][start.col] = 'S';
  grid[goal.row][goal.col] = 'G';
  const open: Position[] = [];
  for (let row = 1; row < size - 1; row++) for (let col = 1; col < size - 1; col++) if (grid[row][col] === '.') open.push({ row, col });
  const starCount = id < 11 ? 3 : id < 21 ? 4 : 5;
  const stars = Array.from({ length: starCount }, (_, index) => open[Math.floor((index + 1) * open.length / (starCount + 1))]);
  return { id, rows: size, columns: size, layout: grid.map(row => row.join('')), playerStart: start, goal, stars };
}

const challengeStages = Array.from({ length: 25 }, (_, index) => {
  const id = (index + 6) as StageId;
  const size = id <= 10 ? 11 : id <= 20 ? 13 : 15;
  return makeChallengeStage(id, size);
});

export const stages: readonly StageDefinition[] = [...starterStages, ...challengeStages];

// Fail fast during tests and production builds. An unwinnable stage must never ship.
const invalidStages = stages.filter(stage => !validateStage(stage));
if (invalidStages.length > 0) throw new Error(`Invalid maze stage(s): ${invalidStages.map(stage => stage.id).join(', ')}`);
