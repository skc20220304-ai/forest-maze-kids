import type { StageDefinition, StageId } from '../domain/types';
import { validateDifficultyProgression, validateStage } from '../domain/maze';

// Authored layouts. Each stage is intentionally stored as data so its shape can be reviewed
// independently instead of being produced by one repeated runtime generator.
const baseStages: readonly Omit<StageDefinition, 'difficulty'>[] = [
 {id:1,rows:5,columns:5,layout:['S..##','##.##','.....','##...','####G'],playerStart:{row:0,col:0},goal:{row:4,col:4},stars:[{row:0,col:1},{row:2,col:0},{row:3,col:2}]},
 {id:2,rows:6,columns:6,layout:['##G###','...#.#','.#...#','.#.###','S....#','######'],playerStart:{row:4,col:0},goal:{row:0,col:2},stars:[{row:3,col:2},{row:2,col:4},{row:1,col:1}]},
 {id:3,rows:6,columns:6,layout:['###G##','#...##','#.#.##','#.#.##','#S...#','######'],playerStart:{row:4,col:1},goal:{row:0,col:3},stars:[{row:4,col:2},{row:2,col:3},{row:1,col:1}]},
 {id:4,rows:6,columns:7,layout:['###G###','....#.#','.#...##','.#...##','S..#..#','#######'],playerStart:{row:4,col:0},goal:{row:0,col:3},stars:[{row:4,col:2},{row:3,col:3},{row:1,col:1}]},
 {id:5,rows:7,columns:7,layout:['#######','#G#####','#.....#','###.#.#','#...#.#','#S#####','#######'],playerStart:{row:5,col:1},goal:{row:1,col:1},stars:[{row:4,col:2},{row:2,col:2},{row:2,col:5}]},
 {id:6,rows:7,columns:7,layout:['#######','#S..#G#','###.#.#','#.#...#','#.###.#','#.....#','#######'],playerStart:{row:1,col:1},goal:{row:1,col:5},stars:[{row:1,col:3},{row:4,col:5},{row:1,col:2}]},
 {id:7,rows:8,columns:8,layout:['########','#....S##','#.######','#...#.##','###.#.##','#G....##','########','########'],playerStart:{row:1,col:5},goal:{row:5,col:1},stars:[{row:1,col:2},{row:5,col:4},{row:1,col:4}]},
 {id:8,rows:8,columns:8,layout:['########','#....G##','#.#.####','#.#...##','#####.##','#S....##','########','########'],playerStart:{row:5,col:1},goal:{row:1,col:5},stars:[{row:5,col:4},{row:1,col:2},{row:5,col:2}]},
 {id:9,rows:9,columns:9,layout:['#########','#G#.....#','#.#.#.###','#.#.#...#','#.#.###.#','#.#.#.#.#','#.#.#.#.#','#.....#S#','#########'],playerStart:{row:7,col:7},goal:{row:1,col:1},stars:[{row:2,col:5},{row:1,col:6},{row:7,col:4}]},
 {id:10,rows:9,columns:9,layout:['#########','#S#.....#','#.#####.#','#.......#','#######.#','#....G#.#','#.#####.#','#.......#','#########'],playerStart:{row:1,col:1},goal:{row:5,col:5},stars:[{row:3,col:6},{row:2,col:7},{row:2,col:1}]},
 {id:11,rows:10,columns:10,layout:['##########','#.#...#S##','#.#.#.#.##','#...#.#.##','#.###.#.##','#...#...##','###.######','#G......##','##########','##########'],playerStart:{row:1,col:7},goal:{row:7,col:1},stars:[{row:4,col:5},{row:2,col:1},{row:7,col:4}]},
 {id:12,rows:10,columns:10,layout:['##########','#.......##','#.#####.##','#...#...##','###.#.####','#...#...##','#.#####.##','#S#G....##','##########','##########'],playerStart:{row:7,col:1},goal:{row:7,col:3},stars:[{row:3,col:1},{row:6,col:1},{row:5,col:1}]},
 {id:13,rows:11,columns:11,layout:['###########','#.....#...#','#.###.#.#.#','#.#...#.#.#','#.#.#.#.#.#','#.#.#.#.#.#','#.#.#.#.#.#','#.#.#.#.#.#','#.#.###.#.#','#G#.....#S#','###########'],playerStart:{row:9,col:9},goal:{row:9,col:1},stars:[{row:3,col:7},{row:4,col:5},{row:8,col:9}]},
 {id:14,rows:11,columns:11,layout:['###########','#S........#','#########.#','#.....#.#.#','#.###.#.#.#','#...#...#.#','#.#.#####.#','#.#...#...#','#.###.#.###','#...#....G#','###########'],playerStart:{row:1,col:1},goal:{row:9,col:9},stars:[{row:1,col:6},{row:9,col:6},{row:1,col:2}]},
 {id:15,rows:12,columns:12,layout:['############','#G#......S##','#.#.########','#.#.......##','#.#######.##','#.#.....#.##','#.#.###.#.##','#.#...#.#.##','#.###.#.#.##','#.....#...##','############','############'],playerStart:{row:1,col:9},goal:{row:1,col:1},stars:[{row:3,col:8},{row:1,col:8},{row:1,col:7}]},
 {id:16,rows:12,columns:12,layout:['############','#........G##','#.#.########','#.#.......##','#.#######.##','#.#.......##','#.#.########','#.#.......##','#########.##','#S........##','############','############'],playerStart:{row:9,col:1},goal:{row:1,col:9},stars:[{row:7,col:8},{row:1,col:2},{row:9,col:2}]},
 {id:17,rows:13,columns:13,layout:['#############','#G#.....#...#','#.#.#.#.#.#.#','#.#.#.#.#.#.#','#.#.#.#.#.#.#','#.#.#.#...#.#','#.#.#.#.#####','#...#.#.#...#','#.###.###.#.#','#...#...#.#.#','###.###.#.#.#','#.....#...#S#','#############'],playerStart:{row:11,col:11},goal:{row:1,col:1},stars:[{row:11,col:8},{row:1,col:6},{row:8,col:1}]},
 {id:18,rows:13,columns:13,layout:['#############','#S#.....#...#','#.#.#.###.#.#','#.#.#...#.#.#','#.#.###.#.#.#','#.#...#...#.#','#.###.#####.#','#.#...#.....#','#.#####.###.#','#.#.....#...#','#.#.#####.###','#...#......G#','#############'],playerStart:{row:1,col:1},goal:{row:11,col:11},stars:[{row:10,col:1},{row:6,col:11},{row:11,col:8}]},
 {id:19,rows:14,columns:14,layout:['##############','#.#.......#S##','#.#.###.#.#.##','#.#...#.#.#.##','#.###.#.###.##','#.....#.....##','#.############','#.#.....#...##','#.#.###.###.##','#.#...#.....##','#.###.#####.##','#.....#G....##','##############','##############'],playerStart:{row:1,col:11},goal:{row:11,col:7},stars:[{row:1,col:3},{row:4,col:1},{row:8,col:11}]},
 {id:20,rows:14,columns:14,layout:['##############','#.........#G##','#.#######.#.##','#.#.#.....#.##','#.#.#.#####.##','#.#.........##','#.#########.##','#...#.......##','###.#.########','#...#.......##','#.#########.##','#S#.........##','##############','##############'],playerStart:{row:11,col:1},goal:{row:1,col:11},stars:[{row:4,col:1},{row:5,col:4},{row:6,col:11}]},
 {id:21,rows:15,columns:15,layout:['###############','#.....#...#...#','#.#.#.#.#.#.#.#','#.#.#.#.#...#.#','#.#.#.#.#####.#','#.#.#G#.#...#.#','#.#.###.###.#.#','#.#...#.#...#.#','#.###.#.#.###.#','#.#...#.#...#.#','#.#.#.#.###.#.#','#.#.#.#...#.#.#','#.#.#####.#.#.#','#.#.........#S#','###############'],playerStart:{row:13,col:13},goal:{row:5,col:5},stars:[{row:3,col:9},{row:10,col:5},{row:13,col:10}]},
 {id:22,rows:15,columns:15,layout:['###############','#S#.......#...#','#.#.#####.#.#.#','#...#...#...#.#','#######.#####.#','#.#.....#.....#','#.#.#.#.#.#####','#...#.#G#.....#','#.###.#######.#','#.#.#...#...#.#','#.#.###.#.#.#.#','#.#.#...#.#.#.#','#.#.#.###.#.#.#','#...#.....#...#','###############'],playerStart:{row:1,col:1},goal:{row:7,col:7},stars:[{row:1,col:13},{row:4,col:7},{row:5,col:4}]},
 {id:23,rows:15,columns:15,layout:['###############','#.......#...#S#','#.#####.###.#.#','#.#.........#.#','#.#####.#####.#','#.....#.#.....#','#.###.#.#.#####','#...#.#.#...#.#','###.#.#.###.#.#','#...#.#...#.#.#','#.###.#.###.#.#','#...#.#.#...#.#','###.#.###.###.#','#G..#.........#','###############'],playerStart:{row:1,col:13},goal:{row:13,col:1},stars:[{row:9,col:11},{row:4,col:1},{row:13,col:10}]},
 {id:24,rows:15,columns:15,layout:['###############','#.....#.......#','#.#.#.#.#.#.#.#','#.#.....#...#.#','#.#######.#.#.#','#.#.......#G#.#','#.#.#.#######.#','#...#.#.......#','#.#####.#####.#','#.#.....#...#.#','###.#####.#.#.#','#...#.....#.#.#','#.###.#######.#','#S#...........#','###############'],playerStart:{row:13,col:1},goal:{row:5,col:11},stars:[{row:9,col:5},{row:3,col:10},{row:8,col:13}]},
 {id:25,rows:15,columns:15,layout:['###############','#G#.......#...#','#.#.#.###.###.#','#.#.#.#...#...#','#.#.#.#.###.#.#','#.#.#.#.....#.#','#.#.#.#######.#','#.#.#.#.......#','#.#.#.#.#######','#.#.#.#.#.....#','#.#.#.#.#.###.#','#.#.#.#.#.#.#.#','#.#.#.###.#.#.#','#...#.......#S#','###############'],playerStart:{row:13,col:13},goal:{row:1,col:1},stars:[{row:13,col:6},{row:1,col:6},{row:13,col:10}]},
 {id:26,rows:15,columns:15,layout:['###############','#S..#.........#','###.###.#####.#','#.#.....#...#.#','#.#######.#.#.#','#.......#.#.#.#','#.#.###.#.###.#','#.#.#.....#...#','###.#.#####.###','#...#.#...#.#G#','#.#.###.#.#.#.#','#.#.#...#.#.#.#','#.###.###.#.#.#','#.......#.....#','###############'],playerStart:{row:1,col:1},goal:{row:9,col:13},stars:[{row:1,col:7},{row:1,col:6},{row:13,col:10}]},
 {id:27,rows:15,columns:15,layout:['###############','#.....#.....#S#','#.#####.#.###.#','#.#.....#.....#','#.#.###########','#.#...#.......#','#.###.#.#####.#','#...#...#...#.#','#.#.#####.###.#','#.#.#...#.....#','#.###.#.#.#####','#...#.#.#.#...#','#.#.#.#.#.###.#','#G#...#.......#','###############'],playerStart:{row:1,col:13},goal:{row:13,col:1},stars:[{row:5,col:3},{row:8,col:9},{row:13,col:10}]},
 {id:28,rows:15,columns:15,layout:['###############','#.#......G#...#','#.#.#.#####.#.#','#.#.#.......#.#','#.#.#########.#','#.#.#.....#...#','#.#.#.#.#.#.#.#','#.....#.#...#.#','#.#######.###.#','#...#.....#.#.#','###.#.#####.#.#','#...#.#...#...#','#####.#.#.#.###','#S....#.#.....#','###############'],playerStart:{row:13,col:1},goal:{row:1,col:9},stars:[{row:9,col:7},{row:6,col:7},{row:7,col:10}]},
 {id:29,rows:15,columns:15,layout:['###############','#...#....G#...#','#.#.#.#.###.#.#','#.#...#.#...#.#','#.#####.#.###.#','#.....#.#.#.#.#','#.###.###.#.#.#','#.#.#.......#.#','#.#.#########.#','#.#.#.....#...#','#.#.#.###.#.###','#.#...#...#...#','#.#####.#.###.#','#.......#...#S#','###############'],playerStart:{row:13,col:13},goal:{row:1,col:9},stars:[{row:3,col:13},{row:6,col:1},{row:7,col:10}]},
 {id:30,rows:15,columns:15,layout:['###############','#S#.....#.....#','#.#.###.#####.#','#.#.#.#...#...#','#.#.#.###.#.#.#','#.#.#...#...#.#','#.#.#.#######.#','#...#.......#.#','#####.#.#####.#','#.....#.#.....#','#.#####.#.#####','#.#...#...#G..#','#.#.#.#######.#','#...#.........#','###############'],playerStart:{row:1,col:1},goal:{row:11,col:11},stars:[{row:3,col:9},{row:6,col:5},{row:7,col:8}]},
];

type VariantTransform = 'rotate' | 'mirror' | 'flip';
const transformPoint = (point: { row: number; col: number }, stage: Omit<StageDefinition, 'difficulty'>, transform: VariantTransform) => {
  if (transform === 'rotate') return { row: point.col, col: stage.rows - 1 - point.row };
  if (transform === 'mirror') return { row: point.row, col: stage.columns - 1 - point.col };
  return { row: stage.rows - 1 - point.row, col: point.col };
};
const transformLayout = (stage: Omit<StageDefinition, 'difficulty'>, transform: VariantTransform) => {
  if (transform === 'mirror') return stage.layout.map(row => [...row].reverse().join(''));
  if (transform === 'flip') return [...stage.layout].reverse();
  return Array.from({ length: stage.columns }, (_, row) => Array.from({ length: stage.rows }, (_, col) => stage.layout[stage.rows - 1 - col][row]).join(''));
};
const bonusSpecs: readonly [number, VariantTransform][] = [[11,'rotate'],[12,'mirror'],[13,'flip'],[14,'rotate'],[15,'mirror'],[16,'flip'],[17,'rotate'],[18,'mirror'],[19,'flip'],[20,'rotate'],[21,'mirror'],[22,'flip'],[23,'rotate'],[24,'mirror'],[25,'flip'],[26,'rotate'],[27,'mirror'],[28,'flip'],[29,'rotate'],[30,'mirror']];
const bonusStages: readonly StageDefinition[] = bonusSpecs.map(([sourceId, transform], index) => {
  const source = baseStages[sourceId - 1]; const id = (index + 31) as StageId;
  return { id, difficulty: id, rows: transform === 'rotate' ? source.columns : source.rows, columns: transform === 'rotate' ? source.rows : source.columns, layout: transformLayout(source, transform), playerStart: transformPoint(source.playerStart, source, transform), goal: transformPoint(source.goal, source, transform), stars: source.stars.map(star => transformPoint(star, source, transform)) };
});

type Node = { row: number; col: number };
const directions: readonly Node[] = [{ row: -1, col: 0 }, { row: 1, col: 0 }, { row: 0, col: -1 }, { row: 0, col: 1 }];
const nodeKey = (node: Node) => `${node.row}:${node.col}`;
const makeRandom = (seed: number) => () => {
  let value = seed += 0x6d2b79f5;
  value = Math.imul(value ^ value >>> 15, value | 1);
  value ^= value + Math.imul(value ^ value >>> 7, value | 61);
  return ((value ^ value >>> 14) >>> 0) / 4294967296;
};
const shuffled = <T>(items: readonly T[], random: () => number) => [...items].sort(() => random() - .5);
const distance = (from: Node, graph: Map<string, Node[]>) => {
  const queue: Array<[Node, number]> = [[from, 0]], seen = new Set([nodeKey(from)]);
  let furthest = queue[0];
  while (queue.length) {
    const entry = queue.shift()!;
    furthest = entry;
    for (const next of graph.get(nodeKey(entry[0])) ?? []) if (!seen.has(nodeKey(next))) { seen.add(nodeKey(next)); queue.push([next, entry[1] + 1]); }
  }
  return furthest;
};

/**
 * These are fixed authored blueprints for stages 51-100.  Each seed is a separate
 * layout decision; no stage is made by rotating or mirroring another stage.
 */
const lateStageBlueprints = [
  117, 284, 391, 468, 593, 614, 747, 826, 953, 1084,
  1197, 1286, 1391, 1464, 1593, 1614, 1747, 1826, 1953, 2084,
  2117, 2284, 2391, 2468, 2593, 2614, 2747, 2826, 2953, 3084,
  3117, 3284, 3391, 3468, 3593, 3614, 3747, 3826, 3953, 4084,
  4117, 4284, 4391, 4468, 4593, 4614, 4747, 4826, 4953, 5084,
] as const;
const createLateStage = (seed: number, id: number): StageDefinition => {
  const random = makeRandom(seed);
  const cells = Array.from({ length: 15 }, () => Array.from({ length: 15 }, () => '#'));
  const graph = new Map<string, Node[]>();
  const addNode = (node: Node) => { graph.set(nodeKey(node), []); cells[node.row][node.col] = '.'; };
  const nodes = Array.from({ length: 7 }, (_, row) => Array.from({ length: 7 }, (_, col) => ({ row: row * 2 + 1, col: col * 2 + 1 }))).flat();
  nodes.forEach(addNode);
  const root = nodes[Math.floor(random() * nodes.length)];
  const seen = new Set([nodeKey(root)]), stack = [root];
  while (stack.length) {
    const current = stack[stack.length - 1];
    const candidates = shuffled(directions, random).map(direction => ({ row: current.row + direction.row * 2, col: current.col + direction.col * 2 })).filter(next => next.row > 0 && next.row < 14 && next.col > 0 && next.col < 14 && !seen.has(nodeKey(next)));
    if (!candidates.length) { stack.pop(); continue; }
    const next = candidates[0];
    seen.add(nodeKey(next));
    const mid = { row: (current.row + next.row) / 2, col: (current.col + next.col) / 2 };
    cells[mid.row][mid.col] = '.';
    graph.get(nodeKey(current))!.push(next); graph.get(nodeKey(next))!.push(current);
    stack.push(next);
  }
  const first = distance(root, graph)[0];
  const [goal] = distance(first, graph);
  const leaves = [...graph.entries()].filter(([, links]) => links.length === 1).map(([key]) => { const [row, col] = key.split(':').map(Number); return { row, col }; });
  const starCandidates = leaves.filter(node => nodeKey(node) !== nodeKey(first) && nodeKey(node) !== nodeKey(goal));
  const fallback = [...graph.keys()].map(key => { const [row, col] = key.split(':').map(Number); return { row, col }; }).filter(node => nodeKey(node) !== nodeKey(first) && nodeKey(node) !== nodeKey(goal));
  const stars = (starCandidates.length >= 3 ? shuffled(starCandidates, random) : shuffled(fallback, random)).slice(0, 3);
  cells[first.row][first.col] = 'S'; cells[goal.row][goal.col] = 'G';
  return { id, difficulty: id, rows: 15, columns: 15, layout: cells.map(row => row.join('')), playerStart: first, goal, stars };
};
const lateStages: readonly StageDefinition[] = lateStageBlueprints.map((seed, index) => createLateStage(seed, index + 51));

/**
 * Fixed, independently seeded blueprints for stages 101-150.  These are not
 * rotations or reflections of earlier mazes; each is checked at build time for
 * a reachable goal, three collectible stars, and a one-way goal endpoint.
 */
const advancedStageBlueprints = [
  6117, 6284, 6391, 6468, 6593, 6614, 6747, 6826, 6953, 7084,
  7117, 7284, 7391, 7468, 7593, 7614, 7747, 7826, 7953, 8084,
  8117, 8284, 8391, 8468, 8593, 8614, 8747, 8826, 8953, 9084,
  9117, 9284, 9391, 9468, 9593, 9614, 9747, 9826, 9953, 10084,
  10117, 10284, 10391, 10468, 10593, 10614, 10747, 10826, 10953, 11084,
] as const;
const advancedStages: readonly StageDefinition[] = advancedStageBlueprints.map((seed, index) => createLateStage(seed, index + 101));

export const stages: readonly StageDefinition[] = [...baseStages.map((stage, index) => ({ ...stage, difficulty: index + 1 })), ...bonusStages, ...lateStages, ...advancedStages];

const invalidStages=stages.filter(stage=>!validateStage(stage));
if(invalidStages.length>0)throw new Error(`Invalid maze stage(s): ${invalidStages.map(stage=>stage.id).join(', ')}`);
if(!validateDifficultyProgression(stages))throw new Error('Stage difficulty must increase from one stage to the next.');
if(new Set(stages.map(stage=>stage.layout.join('|'))).size!==stages.length)throw new Error('Maze layouts must be unique.');
if(stages.slice(1).some((stage,index)=>`${stage.playerStart.row}:${stage.playerStart.col}-${stage.goal.row}:${stage.goal.col}`===`${stages[index].playerStart.row}:${stages[index].playerStart.col}-${stages[index].goal.row}:${stages[index].goal.col}`))throw new Error('Adjacent stages must not share start and goal positions.');
