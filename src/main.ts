import Phaser from 'phaser';
import './styles.css';
import './parent.css';
import type { Direction, GameState } from './domain/types';
import { loadLocalProgress, saveLocalProgress } from './persistence/localProgress';
import { GameScene } from './game/GameScene';
import { firebaseEnabled, auth, signIn, signUp, saveCloudProgress, syncProgress, watchUser } from './persistence/cloudProgress';

const stars=document.querySelector('#stars')!,stageLabel=document.querySelector('#stage')!,overlay=document.querySelector('#overlay') as HTMLElement,title=document.querySelector('#overlay-title')!,next=document.querySelector('#next') as HTMLButtonElement;let current:GameState|null=null;
const emitMove=(d:Direction)=>document.dispatchEvent(new CustomEvent('maze:move',{detail:d}));
document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.classList.add('pressed');emitMove(b.dataset.direction as Direction)});['pointerup','pointercancel','pointerleave'].forEach(n=>b.addEventListener(n,()=>b.classList.remove('pressed')))})
document.addEventListener('keydown',e=>{if(e.repeat)return;const map:Record<string,Direction>={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};if(map[e.key]){e.preventDefault();emitMove(map[e.key])}});
document.querySelector('#reset')!.addEventListener('click',()=>{overlay.hidden=true;document.dispatchEvent(new Event('maze:reset'))});
document.addEventListener('maze:state',e=>{current=(e as CustomEvent<GameState>).detail;const total=current.stageId===1?1:current.stageId===2?2:3;stars.textContent=`⭐ ${current.collectedStars.size} / ${total}`;stageLabel.textContent=`ステージ ${current.stageId}`;if(current.phase==='stageClear'){saveLocalProgress(current.stageId);void saveCloudProgress(current.stageId);overlay.hidden=false;title.textContent=current.stageId===5?'🎉 ぜんぶクリア！ ✨':'🎉 やったー！ ✨';next.hidden=current.stageId===5}});
next.addEventListener('click',()=>{if(!current||current.stageId>=5)return;saveLocalProgress(current.stageId+1);overlay.hidden=true;(game.scene.getScene('game') as GameScene).loadStage(current.stageId+1)});
const game=new Phaser.Game({type:Phaser.CANVAS,parent:'game-container',backgroundColor:'#eaf6d8',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:540,height:540},scene:[GameScene],render:{antialias:true,pixelArt:false}});
void game;
const syncOnLogin=async()=>{if(!auth?.currentUser)return;const result=await syncProgress(loadLocalProgress());saveLocalProgress(result.stage);(game.scene.getScene('game') as GameScene).loadStage(result.stage)};watchUser((user)=>{if(user)void syncOnLogin()});
const parentPanel=document.querySelector('#parent-panel') as HTMLElement;document.querySelector('#parent')!.addEventListener('click',()=>parentPanel.hidden=false);document.querySelector('#close-parent')!.addEventListener('click',()=>parentPanel.hidden=true);
const email=document.querySelector('#email') as HTMLInputElement,password=document.querySelector('#password') as HTMLInputElement,status=document.querySelector('#auth-status')!;const authAction=async(action:'signIn'|'signUp')=>{const result=action==='signIn'?await signIn(email.value,password.value):await signUp(email.value,password.value);status.textContent=result.message;if(result.ok)parentPanel.hidden=true};document.querySelector('#sign-in')!.addEventListener('click',()=>void authAction('signIn'));document.querySelector('#sign-up')!.addEventListener('click',()=>void authAction('signUp'));if(!firebaseEnabled)status.textContent='Firebase未設定です。端末内には保存されます。';
