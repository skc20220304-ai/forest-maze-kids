import {describe,expect,it} from 'vitest';import {stages} from '../src/stages/stages';import {validateStage} from '../src/domain/maze';import {initialState,move} from '../src/domain/reducer';
describe('maze safety',()=>{
  it('validates every stage and keeps IDs unique',()=>{
    expect(stages.map(stage=>stage.id)).toEqual(Array.from({length:30},(_,index)=>index+1));
    expect(new Set(stages.map(stage=>stage.layout.join('|'))).size).toBe(30);
    expect(new Set(stages.map(stage=>`${stage.playerStart.row}:${stage.playerStart.col}-${stage.goal.row}:${stage.goal.col}`)).size).toBe(30);
    stages.forEach(stage=>expect(stage.stars).toHaveLength(3));
    stages.forEach(stage=>expect(validateStage(stage),`stage ${stage.id} must be winnable`).toBe(true));
  });
  it('rejects malformed or unreachable stage data',()=>{
    const invalid={...stages[0],goal:{row:0,col:4},layout:['S...G','.##..','...#.','.#...','....#']} as typeof stages[number];
    expect(validateStage(invalid)).toBe(false);
  });
  it('moves and blocks',()=>{const s=stages[0],state=initialState(s);expect(move(state,s,'right').moved).toBe(true);expect(move(state,s,'up').moved).toBe(false)});
});
