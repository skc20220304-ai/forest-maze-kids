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

export const stages: readonly StageDefinition[] = [...baseStages.map((stage, index) => ({ ...stage, difficulty: index + 1 })), ...bonusStages];

const invalidStages=stages.filter(stage=>!validateStage(stage));
if(invalidStages.length>0)throw new Error(`Invalid maze stage(s): ${invalidStages.map(stage=>stage.id).join(', ')}`);
if(!validateDifficultyProgression(stages))throw new Error('Stage difficulty must increase from one stage to the next.');
