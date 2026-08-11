import Phaser from 'phaser';
import { stages } from '../stages/stages';
import { initialState, move } from '../domain/reducer';
import type { Direction, GameState, StageDefinition, Position } from '../domain/types';

export class GameScene extends Phaser.Scene {
  private stage!: StageDefinition; private state!: GameState; private cell = 64; private layer?: Phaser.GameObjects.Container; private player!: Phaser.GameObjects.Text; private queued: Direction | null = null;
  constructor(){super('game')}
  create(){document.addEventListener('maze:move',this.onMove as EventListener);document.addEventListener('maze:reset',this.onReset);this.loadStage(Number(localStorage.getItem('forest-maze:stage'))||1)}
  loadStage(id:number){this.stage=stages[Math.max(1,Math.min(5,id))-1];this.state=initialState(this.stage);this.queued=null;this.draw();this.emit()}
  private emit(){document.dispatchEvent(new CustomEvent('maze:state',{detail:this.state}))}
  private onMove=(e:Event)=>{const d=(e as CustomEvent<Direction>).detail;if(this.state.phase!=='ready'){if(!this.queued)this.queued=d;return}this.perform(d)}
  private onReset=()=>this.loadStage(this.stage.id)
  private perform(d:Direction){const result=move(this.state,this.stage,d);if(!result.moved){this.state=result.state;this.emit();const x=d==='left'?-8:d==='right'?8:0,y=d==='up'?-8:d==='down'?8:0;this.tweens.add({targets:this.player,x:this.player.x+x,y:this.player.y+y,duration:70,yoyo:true,onComplete:()=>{this.state={...this.state,phase:'ready' as const};this.emit()}});return}this.state=result.state;this.emit();const target=this.cellPosition(this.state.player);this.tweens.add({targets:this.player,x:target.x,y:target.y,duration:140,ease:'Sine.out',onComplete:()=>{if(this.state.phase!=='stageClear'){this.state={...this.state,phase:'ready' as const};this.emit();if(this.queued){const next=this.queued;this.queued=null;this.perform(next)}}}})}
  private cellPosition(p:Position){return{x:p.col*this.cell+this.cell/2,y:p.row*this.cell+this.cell/2}}
  private draw(){this.layer?.destroy();this.layer=this.add.container(0,0);this.cell=Math.min(540/this.stage.columns,540/this.stage.rows);this.layer.add(this.add.rectangle(this.stage.columns*this.cell/2,this.stage.rows*this.cell/2,this.stage.columns*this.cell,this.stage.rows*this.cell,0xfff8df));for(let r=0;r<this.stage.rows;r++)for(let c=0;c<this.stage.columns;c++){const blocked=this.stage.layout[r][c]==='#',rect=this.add.rectangle(c*this.cell+this.cell/2,r*this.cell+this.cell/2,this.cell-2,this.cell-2,blocked?0x3f8f55:0xfff8df);rect.setStrokeStyle(2,blocked?0x1f5f38:0xe7dcae);this.layer.add(rect)}for(const s of this.stage.stars){const p=this.cellPosition(s);this.layer.add(this.add.text(p.x,p.y,'⭐',{fontFamily:'system-ui',fontSize:`${Math.max(22,this.cell*.48)}px`}).setOrigin(.5))}const g=this.cellPosition(this.stage.goal);this.layer.add(this.add.text(g.x,g.y,'🎁',{fontFamily:'system-ui',fontSize:`${Math.max(24,this.cell*.52)}px`}).setOrigin(.5));const p=this.cellPosition(this.stage.playerStart);this.player=this.add.text(p.x,p.y,'🐰',{fontFamily:'system-ui',fontSize:`${Math.max(26,this.cell*.58)}px`}).setOrigin(.5);this.layer.add(this.player)}
}
