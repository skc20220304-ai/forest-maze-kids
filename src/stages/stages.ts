import type { StageDefinition } from '../domain/types';
export const stages: readonly StageDefinition[] = [
 {id:1,rows:5,columns:5,layout:['S....','.##..','...#.','.#...','....G'],playerStart:{row:0,col:0},goal:{row:4,col:4},stars:[{row:0,col:2}]},
 {id:2,rows:6,columns:6,layout:['S.....','.##...','...#..','.##...','....#.','.....G'],playerStart:{row:0,col:0},goal:{row:5,col:5},stars:[{row:0,col:2},{row:4,col:2}]},
 {id:3,rows:7,columns:7,layout:['S......','.##....','...#...','.###...','.......','..##...','......G'],playerStart:{row:0,col:0},goal:{row:6,col:6},stars:[{row:0,col:2},{row:2,col:5},{row:6,col:2}]},
 {id:4,rows:8,columns:8,layout:['S...#...','.##.#.##','...#....','##.#.###','...#....','.###.##.','...#...G','........'],playerStart:{row:0,col:0},goal:{row:6,col:7},stars:[{row:0,col:2},{row:2,col:6},{row:7,col:3}]},
 {id:5,rows:9,columns:9,layout:['S...#....','.##.#.###','...#.....','##.###.#.','...#...#.','.#.###.#.','.#.....#.','.#####...','........G'],playerStart:{row:0,col:0},goal:{row:8,col:8},stars:[{row:0,col:2},{row:2,col:6},{row:8,col:3}]}
];
