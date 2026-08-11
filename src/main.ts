import Phaser from 'phaser';
import './styles.css';
import './parent.css';
import type { Direction, GameState } from './domain/types';
import { loadLocalProgress, saveLocalProgress } from './persistence/localProgress';
import { GameScene } from './game/GameScene';
import { sendOtp, verifyOtp, loadCloudProgress, saveCloudProgress, supabase } from './persistence/cloudProgress';

const stars=document.querySelector('#stars')!,stageLabel=document.querySelector('#stage')!,overlay=document.querySelector('#overlay') as HTMLElement,title=document.querySelector('#overlay-title')!,next=document.querySelector('#next') as HTMLButtonElement;let current:GameState|null=null;
const emitMove=(d:Direction)=>document.dispatchEvent(new CustomEvent('maze:move',{detail:d}));
document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.classList.add('pressed');emitMove(b.dataset.direction as Direction)});['pointerup','pointercancel','pointerleave'].forEach(n=>b.addEventListener(n,()=>b.classList.remove('pressed')))})
document.addEventListener('keydown',e=>{if(e.repeat)return;const map:Record<string,Direction>={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};if(map[e.key]){e.preventDefault();emitMove(map[e.key])}});
document.querySelector('#reset')!.addEventListener('click',()=>{overlay.hidden=true;document.dispatchEvent(new Event('maze:reset'))});
document.addEventListener('maze:state',e=>{current=(e as CustomEvent<GameState>).detail;const total=current.stageId===1?1:current.stageId===2?2:3;stars.textContent=`⭐ ${current.collectedStars.size} / ${total}`;stageLabel.textContent=`ステージ ${current.stageId}`;if(current.phase==='stageClear'){saveLocalProgress(current.stageId);void saveCloudProgress(current.stageId);overlay.hidden=false;title.textContent=current.stageId===5?'🎉 ぜんぶクリア！ ✨':'🎉 やったー！ ✨';next.hidden=current.stageId===5}});
next.addEventListener('click',()=>{if(!current||current.stageId>=5)return;saveLocalProgress(current.stageId+1);overlay.hidden=true;(game.scene.getScene('game') as GameScene).loadStage(current.stageId+1)});
const game=new Phaser.Game({type:Phaser.CANVAS,parent:'game-container',backgroundColor:'#eaf6d8',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:540,height:540},scene:[GameScene],render:{antialias:true,pixelArt:false}});
void game;
const syncOnLogin=async()=>{if(!supabase)return;const {data:{session}}=await supabase.auth.getSession();if(!session)return;const result=await (await import('./persistence/cloudProgress')).syncProgress(loadLocalProgress());saveLocalProgress(result.stage);(game.scene.getScene('game') as GameScene).loadStage(result.stage)};void syncOnLogin();supabase?.auth.onAuthStateChange((_event,session)=>{if(session)void syncOnLogin()});
const parentPanel=document.querySelector('#parent-panel') as HTMLElement;document.querySelector('#parent')!.addEventListener('click',()=>parentPanel.hidden=false);document.querySelector('#close-parent')!.addEventListener('click',()=>parentPanel.hidden=true);
const email=document.querySelector('#email') as HTMLInputElement,otp=document.querySelector('#otp') as HTMLInputElement,status=document.querySelector('#auth-status')!;document.querySelector('#send-code')!.addEventListener('click',async()=>{status.textContent=await sendOtp(email.value)?'メールのコードを確認してください。':'Supabase未設定または送信に失敗しました。';(document.querySelector('#otp-label') as HTMLElement).hidden=false;(document.querySelector('#verify-code') as HTMLElement).hidden=false});document.querySelector('#verify-code')!.addEventListener('click',async()=>{if(await verifyOtp(email.value,otp.value)){const remote=await loadCloudProgress();if(remote){const merged=Math.max(loadLocalProgress(),remote);saveLocalProgress(merged);(game.scene.getScene('game') as GameScene).loadStage(merged)}status.textContent='クラウドに保存されています。'}else status.textContent='コードを確認できませんでした。'});if(!supabase)status.textContent='Supabase未設定です。端末内には保存されます。';
