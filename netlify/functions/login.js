const { createClient } = require('@supabase/supabase-js');
const respond=(status,obj)=>({statusCode:status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Pragma':'no-cache'},body:JSON.stringify(obj)});
const denied=()=>respond(401,{error:'Identifiant ou mot de passe incorrect'});
exports.handler=async event=>{
 if(event.httpMethod!=='POST')return respond(405,{error:'Méthode non autorisée'});
 const url=process.env.SUPABASE_URL,secret=process.env.SUPABASE_SERVICE_ROLE_KEY,anon=process.env.SUPABASE_ANON_KEY;
 if(!url||!secret||!anon)return respond(503,{error:'Configuration serveur manquante'});
 if((event.body||'').length>4096)return respond(413,{error:'Requête trop volumineuse'});
 let body;try{body=JSON.parse(event.body||'{}')}catch{return denied()}
 const username=typeof body.username==='string'?body.username.trim().toLowerCase():'';
 if(!/^[a-z0-9._-]{3,40}$/.test(username)||typeof body.password!=='string'||!body.password||body.password.length>1024)return denied();
 try{
  const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:profile,error:profileError}=await admin.from('member_profiles').select('user_id').eq('username',username).maybeSingle();
  if(profileError||!profile)return denied();
  const {data:record,error:userError}=await admin.auth.admin.getUserById(profile.user_id);
  if(userError||!record?.user?.email)return denied();
  const auth=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await auth.auth.signInWithPassword({email:record.user.email,password:body.password});
  if(error||!data?.session)return denied();
  return respond(200,{access_token:data.session.access_token,refresh_token:data.session.refresh_token});
 }catch{return denied()}
};
