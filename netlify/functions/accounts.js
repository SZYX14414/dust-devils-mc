const { createClient } = require('@supabase/supabase-js');
const url=process.env.SUPABASE_URL;
const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
const roles=['admin','bureau','treasurer','member','viewer'];
const validName=x=>typeof x==='string'&&/^[a-z0-9._-]{3,40}$/.test(x);
const emailFor=x=>x+'@members.dustdevils.invalid';
const respond=(status,obj)=>({statusCode:status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(obj)});
exports.handler=async event=>{
 if(event.httpMethod!=='POST')return respond(405,{error:'Méthode refusée'});
 if(!url||!secret)return respond(503,{error:'Configuration serveur manquante'});
 try{
 const token=(event.headers.authorization||event.headers.Authorization||'').replace(/^Bearer\s+/i,'');if(!token)return respond(401,{error:'Non connecté'});
 const sb=createClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
 const {data:{user},error:authError}=await sb.auth.getUser(token);if(authError||!user)return respond(401,{error:'Session invalide'});
 const {data:caller,error:profileError}=await sb.from('member_profiles').select('role').eq('user_id',user.id).single();if(profileError||caller?.role!=='admin')return respond(403,{error:'Réservé aux administrateurs'});
 const body=JSON.parse(event.body||'{}');const {action,username,password,role,member_name}=body;
 if(!validName(username))return respond(400,{error:'Identifiant invalide (3 à 40 caractères, minuscules, chiffres, points, tirets)'});
 if(action==='create'){
  if(!roles.includes(role)||typeof member_name!=='string'||!member_name.trim()||member_name.length>100||typeof password!=='string'||password.length<12)return respond(400,{error:'Nom, rôle ou mot de passe invalide (12 caractères min.)'});
  const {data:created,error:ce}=await sb.auth.admin.createUser({email:emailFor(username),password,email_confirm:true});if(ce)return respond(400,{error:ce.message});
  const {error:pe}=await sb.from('member_profiles').insert({user_id:created.user.id,username,member_name:member_name.trim(),role});if(pe){await sb.auth.admin.deleteUser(created.user.id);return respond(400,{error:pe.message})}return respond(200,{ok:true});
 }
 const {data:target,error:te}=await sb.from('member_profiles').select('user_id,role').eq('username',username).single();if(te||!target)return respond(404,{error:'Compte introuvable'});
 if(target.user_id===user.id&&['disable','role'].includes(action))return respond(400,{error:'Impossible de modifier son propre rôle ou de désactiver son compte'});
 if(action==='role'){if(!roles.includes(role))return respond(400,{error:'Rôle invalide'});const {error}=await sb.from('member_profiles').update({role}).eq('user_id',target.user_id);if(error)throw error;return respond(200,{ok:true})}
 if(action==='password'){if(typeof password!=='string'||password.length<12)return respond(400,{error:'Mot de passe de 12 caractères minimum requis'});const {error}=await sb.auth.admin.updateUserById(target.user_id,{password});if(error)throw error;return respond(200,{ok:true})}
 if(action==='disable'||action==='enable'){const {error}=await sb.auth.admin.updateUserById(target.user_id,{ban_duration:action==='disable'?'876000h':'none'});if(error)throw error;return respond(200,{ok:true})}
 return respond(400,{error:'Action inconnue'});
 }catch(e){return respond(500,{error:'Erreur serveur : '+e.message})}
};
