const {respond,authenticate}=require('./_auth');
const channels=['general','bureau','tresorerie'];
function canRead(p,c){return c==='general'||p.role==='admin'||(c==='bureau'&&p.role==='bureau')||(c==='tresorerie'&&(p.role==='treasurer'||p.role==='bureau'));}
exports.handler=async event=>{
 if(event.httpMethod!=='POST')return respond(405,{error:'Méthode non autorisée'});
 if((event.body||'').length>3000)return respond(413,{error:'Message trop long'});
 try{
  const {sb,profile}=await authenticate(event);
  if(profile.must_change_password)return respond(403,{error:'Changez votre mot de passe'});
  const body=JSON.parse(event.body||'{}'),channel=body.channel;
  if(!channels.includes(channel)||!canRead(profile,channel))return respond(403,{error:'Salon interdit'});
  if(body.action==='list'){
   const {data,error}=await sb.from('club_chat_messages').select('id,channel,author_id,author_name,body,created_at').eq('channel',channel).order('id',{ascending:false}).limit(80);
   if(error)throw error;
   return respond(200,{messages:(data||[]).reverse()});
  }
  if(body.action==='send'){
   const message=typeof body.message==='string'?body.message.trim():'';
   if(!message||message.length>1200)return respond(400,{error:'Message requis (1200 caractères max)'});
   const {error}=await sb.from('club_chat_messages').insert({channel,author_id:profile.user_id,author_name:profile.member_name,body:message});
   if(error)throw error;
   return respond(200,{ok:true});
  }
  return respond(400,{error:'Action inconnue'});
 }catch(e){return respond(e.status||500,{error:e.status?e.message:'Erreur serveur : '+e.message})}
};
