const SHEET_ID = '17MoIa_ux09Bh2xW3RjOuJZOpGdmTTRM0N00Uk1SK1IU';
const GID = '1726770044';
function parseCSV(text) {
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){row.push(cell);cell=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x!==''))rows.push(row);row=[];cell=''}else cell+=c}
 row.push(cell);if(row.some(x=>x!==''))rows.push(row);return rows;
}
const number=v=>Number(String(v||'0').replace(/[^0-9,.-]/g,'').replace(',','.'))||0;
function date(v){const s=String(v||'').trim(),m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(.*)$/);return m?`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}T${m[4]}`:s.replace(' ','T')}
function parseActions(csv){
 if(/^\s*</.test(csv))throw Error('Google a renvoyé une page HTML : partage de la feuille à vérifier');
 const rows=parseCSV(csv.replace(/^\uFEFF/,''));const header=(rows.shift()||[]).map(x=>x.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''));
 const find=(...names)=>header.findIndex(x=>names.includes(x));
 const ix=[find('horodateur','timestamp','date'),find('nom','nom rp','membre'),find('action faite','action','type d action'),find('argent sale','sale'),find('argent propre','propre')];
 if(ix.some(i=>i<0))throw Error('Colonnes Google inattendues : '+header.join(', '));
 return rows.filter(r=>r[ix[1]]&&r[ix[2]]).map(r=>({date:date(r[ix[0]]),member:r[ix[1]].trim(),title:r[ix[2]].trim(),dirty:number(r[ix[3]]),clean:number(r[ix[4]])}));
}
exports.handler=async()=>{
 try{
  const urls=[`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID}`,`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`];
  let lastError;
  for(const url of urls){try{
   const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}});
   if(!response.ok)throw Error('Google HTTP '+response.status);
   const actions=parseActions(await response.text());
   return {statusCode:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:JSON.stringify({ok:true,actions})};
  }catch(e){lastError=e}}
  throw lastError;
 }catch(e){return {statusCode:502,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:JSON.stringify({ok:false,error:String(e.message||e)})}}
};
