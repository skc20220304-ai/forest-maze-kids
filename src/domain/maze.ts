import type { Direction, Position, StageDefinition } from './types';
const delta: Record<Direction, Position>={up:{row:-1,col:0},down:{row:1,col:0},left:{row:0,col:-1},right:{row:0,col:1}};
export function canMove(stage:StageDefinition,p:Position,d:Direction){const n={row:p.row+delta[d].row,col:p.col+delta[d].col};return n.row>=0&&n.row<stage.rows&&n.col>=0&&n.col<stage.columns&&stage.layout[n.row][n.col]!=='#'}
export function nextPosition(p:Position,d:Direction){return {row:p.row+delta[d].row,col:p.col+delta[d].col}}
const cellPattern=/^[.#SG]+$/;
const keyOf=(p:Position)=>`${p.row}:${p.col}`;
const inBounds=(p:Position,rows:number,columns:number)=>Number.isInteger(p.row)&&Number.isInteger(p.col)&&p.row>=0&&p.row<rows&&p.col>=0&&p.col<columns;

/**
 * Stage data is treated as untrusted configuration. Keep this validator strict:
 * malformed data must fail tests/build instead of producing an unwinnable maze.
 */
export function validateStage(stage:StageDefinition){
  if(!stage||!Number.isInteger(stage.rows)||!Number.isInteger(stage.columns)||stage.rows<=0||stage.columns<=0)return false;
  if(stage.layout.length!==stage.rows||stage.layout.some(row=>typeof row!=='string'||row.length!==stage.columns||!cellPattern.test(row)))return false;
  const starts=stage.layout.flatMap((row,r)=>[...row].flatMap((cell,c)=>cell==='S'?[{row:r,col:c}]:[]));
  const goals=stage.layout.flatMap((row,r)=>[...row].flatMap((cell,c)=>cell==='G'?[{row:r,col:c}]:[]));
  if(starts.length!==1||goals.length!==1||!inBounds(stage.playerStart,stage.rows,stage.columns)||!inBounds(stage.goal,stage.rows,stage.columns))return false;
  if(stage.layout[stage.playerStart.row][stage.playerStart.col]==='#'||stage.layout[stage.goal.row][stage.goal.col]==='#')return false;
  if(keyOf(stage.playerStart)!==keyOf(starts[0])||keyOf(stage.goal)!==keyOf(goals[0]))return false;
  const starKeys=new Set<string>();
  if(stage.stars.some(star=>!inBounds(star,stage.rows,stage.columns)||stage.layout[star.row][star.col]==='#'||starKeys.has(keyOf(star))||!starKeys.add(keyOf(star))))return false;
  const q=[stage.playerStart],seen=new Set([keyOf(stage.playerStart)]),ds:Direction[]=['up','down','left','right'];
  while(q.length){const p=q.shift()!;for(const d of ds)if(canMove(stage,p,d)){const n=nextPosition(p,d),k=keyOf(n);if(!seen.has(k)){seen.add(k);q.push(n)}}}
  return seen.has(keyOf(stage.goal))&&stage.stars.every(star=>seen.has(keyOf(star)));
}
