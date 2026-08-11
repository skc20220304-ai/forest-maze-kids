import { createClient } from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL as string|undefined, key=import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined;
export const supabase=url&&key?createClient(url,key):null;
export async function sendOtp(email:string){if(!supabase)return false;const {error}=await supabase.auth.signInWithOtp({email,options:{shouldCreateUser:true}});return !error}
export async function verifyOtp(email:string,token:string){if(!supabase)return false;const {error}=await supabase.auth.verifyOtp({email,token,type:'email'});return !error}
export async function loadCloudProgress(){if(!supabase)return null;const {data}=await supabase.from('game_progress').select('highest_stage').maybeSingle();return data?.highest_stage??null}
export async function saveCloudProgress(stage:number){if(!supabase)return false;const {data:{user}}=await supabase.auth.getUser();if(!user)return false;const {error}=await supabase.from('game_progress').upsert({user_id:user.id,highest_stage:stage,updated_at:new Date().toISOString()});return !error}
