const {respond,authenticate,audit}=require('./_auth');
exports.handler=async event=>{
 if(event.httpMethod!=='POST')return respond(405,{error:'Méthode non autorisée'});
 if((event.body||'').length>8000)return respond(413,{error:'Requête trop volumineuse'});
 try{
  const {sb,profile}=await authenticate(event);
  if(profile.role!=='admin')return respond(403,{error:'Seuls les administrateurs peuvent modifier les grades RP'});
  const {memberIndex,grade,username}=JSON.parse(event.body||'{}');
  if(!Number.isInteger(memberIndex)||memberIndex<0||typeof grade!=='string'||!grade.trim()||grade.length>80)return respond(400,{error:'Membre ou grade invalide'});
  const {data:current,error:ce}=await sb.from('club_data').select('payload,version').eq('section','members').single();if(ce)throw ce;
  const rows=current.payload;
  if(!Array.isArray(rows)||!rows[memberIndex])return respond(409,{error:'Membre introuvable, actualise la liste'});
  const member=rows[memberIndex];if(!member||typeof member!=='object')return respond(400,{error:'Fiche invalide'});
  let linkedId=member.user_id||null;
  if(username){
   if(typeof username!=='string'||!/^[a-z0-9._-]{3,40}$/.test(username))return respond(400,{error:'Identifiant invalide'});
   const {data:login,error:le}=await sb.from('member_logins').select('user_id').eq('username',username).maybeSingle();if(le)throw le;
   if(!login)return respond(404,{error:'Compte de connexion introuvable'});
   if(rows.some((x,i)=>i!==memberIndex&&x.user_id===login.user_id))return respond(409,{error:'Compte déjà lié à une autre fiche membre'});
   linkedId=login.user_id;
  }
  const oldGrade=member.grade||'';const nextGrade=grade.trim();
  rows[memberIndex]={...member,grade:nextGrade,...(linkedId?{user_id:linkedId}:{})};
  const {data:updated,error:ue}=await sb.from('club_data').update({payload:rows,version:current.version+1,updated_at:new Date().toISOString()}).eq('section','members').eq('version',current.version).select('version').maybeSingle();
  if(ue)throw ue;if(!updated)return respond(409,{error:'Liste modifiée par un autre membre. Actualise et recommence.'});
  await audit(sb,profile,'member_grade','members',{member_name:member.name,old_grade:oldGrade,new_grade:nextGrade,linked_account:username||null});
  return respond(200,{ok:true,rows,version:updated.version});
 }catch(e){return respond(e.status||500,{error:e.status?e.message:'Erreur serveur : '+e.message})}
};
