const KEY='achados-v2';
const hoje = (() => {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
})();let itens=[]; 

try{const s=localStorage.getItem(KEY);if(s)itens=JSON.parse(s)}catch(e){}
itens.forEach(i=>{if(i.perg==='Que cartão está no primeiro compartimento?'){delete i.perg;delete i.resp}});
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(itens))}catch(e){alert('Sem espaço para salvar. Use fotos menores ou exclua itens.')}};
let filtro='todos';const ST={aberto:'Em aberto',encontrado:'Objeto encontrado',dono:'Dono encontrado',entregue:'Entregue'};
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=d=>d.split('-').reverse().join('/');
const unlocked=new Set();
function render(){
  const q=$('q').value.trim().toLowerCase(),c=$('cat').value,t=$('sta').value;
  $('stats').innerHTML=`<span><b>${itens.filter(i=>i.st==='aberto').length}</b>em aberto</span><span><b>${itens.filter(i=>i.st==='dono').length}</b>donos encontrados</span><span><b>${itens.filter(i=>i.st==='entregue').length}</b>entregues</span>`;
  const l=itens.filter(i=>(filtro==='todos'||i.tipo===filtro)&&(!c||i.cat===c)&&(!t||i.st===t)&&(!q||((i.nome||'')+(i.local||'')+(i.desc||'')+(i.cor||'')+(i.marca||'')).toLowerCase().includes(q)))
    .sort((a,b)=>(a.st==='entregue')-(b.st==='entregue')||b.id-a.id);
  $('lista').innerHTML=l.length?l.map(i=>{
const lock = i.tipo === 'achei' && !unlocked.has(i.id);   
 return `<article class="tag ${i.tipo} ${i.st==='entregue'?'done':''}">
      <span class="pill">${i.tipo==='perdi'?'Perdido':'Achado'}</span>
      <h3>${esc(i.nome)}</h3>
      ${i.foto?`<img class="foto" src="${esc(i.foto)}" alt="Foto de ${esc(i.nome)}">`:''}
      <div class="chips">${i.cat?`<span>${esc(i.cat)}</span>`:''}${i.cor?`<span>${esc(i.cor)}</span>`:''}${i.marca?`<span>${esc(i.marca)}</span>`:''}${i.ident?`<span>Identificação: ${esc(i.ident)}</span>`:''}</div>
      <p class="meta">${esc(i.local)}, ${fmt(i.data)}</p>
      ${i.desc?`<p>${esc(i.desc)}</p>`:''}
      ${i.onde?`<p class="meta">${i.tipo==='achei'?'Está:':'Última vez visto:'} ${esc(i.onde)}</p>`:''}
      <p class="st">${ST[i.st]}</p>
      ${lock?(i.st==='entregue'?'<p class="hint">Este objeto já foi entregue ao dono.</p>':`<div class="claim"><button class="btn" data-a="meu" data-id="${i.id}">É meu</button><p class="hint">Responda às perguntas de verificação para ver o contato.</p></div>`)
        :`<p class="contact">${esc(i.contato)}</p>`}
      ${i.tipo==='perdi'&&i.st!=='entregue'?`<button class="btn" data-a="enc" data-id="${i.id}" style="margin-bottom:10px">Encontrei este objeto</button>`:''}
      ${me?`<div class="row">
        <select data-a="st" data-id="${i.id}" aria-label="Alterar situação" style="width:auto;padding:5px 8px">${Object.entries(ST).map(([k,v])=>`<option value="${k}" ${k===i.st?'selected':''}>${v}</option>`).join('')}</select>
        <button class="link" data-a="del" data-id="${i.id}">Excluir</button>
      </div>`:''}
      <span class="kind"></span>
    </article>`}).join(''):'<p class="empty">Nenhum item encontrado. Ajuste os filtros ou registre um item.</p>';
}
$('lista').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  const id=+b.dataset.id;
  if(b.dataset.a==='meu'){abrirMeu(id);return}
  if(b.dataset.a==='enc'){abrirEnc(id);return}
  if(!me)return;
  if(b.dataset.a==='del'){itens=itens.filter(x=>x.id!==id);save();render()}
});
$('lista').addEventListener('change',e=>{
  if(me&&e.target.dataset.a==='st'){itens.find(x=>x.id===+e.target.dataset.id).st=e.target.value;save();render()}
});
document.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{
  filtro=b.dataset.f;
  document.querySelectorAll('.seg button').forEach(x=>x.setAttribute('aria-pressed',x===b));
  render();
});
$('q').oninput=render;$('cat').onchange=render;$('sta').onchange=render;

const tog = () => {
  const a = $('tipo').value === 'achei';
  $('sec').style.display = a ? 'block' : 'none';
  $('perg').required = a;
  $('resp').required = a;

  const opcoes = a
    ? ['Biblioteca', 'Ainda no local', 'Outros']
    : ['Sala', 'Refeitório', 'Biblioteca', 'Outros'];

  $('onde').innerHTML = opcoes
    .map(o => `<option>${o}</option>`)
    .join('');

  $('londe').textContent = a
    ? 'Onde o objeto está agora?'
    : 'Onde você viu o objeto pela última vez?';
};

$('tipo').onchange=tog;
document.querySelectorAll('[data-abrir]').forEach(b=>b.onclick=()=>{$('frm').reset();fotoAtual=null;$('prev').style.display='none';$('tipo').value=b.dataset.abrir;$('data').value=hoje;tog();$('dlg').showModal()});
$('cancelar').onclick=()=>$('dlg').close();
$('frm').addEventListener('submit',()=>{
  itens.push({id:Date.now(),tipo:$('tipo').value,nome:$('nome').value.trim(),local:$('local').value.trim(),data:$('data').value,desc:$('desc').value.trim(),contato:$('contato').value.trim(),cat:$('fcat').value,cor:$('cor').value.trim(),marca:$('marca').value.trim(),ident:$('ident').value,onde:$('onde').value,perg:$('perg').value.trim(),resp:$('resp').value.trim(),st:'aberto',foto:fotoAtual});
  save();render();
});
let notifs=[];try{notifs=JSON.parse(localStorage.getItem('achados-notifs'))||[]}catch(e){}
const saveN=()=>{try{localStorage.setItem('achados-notifs',JSON.stringify(notifs))}catch(e){}};
const UK='achados-users';
let users=[];try{users=JSON.parse(localStorage.getItem(UK))||[]}catch(e){}
const saveU=()=>{try{localStorage.setItem(UK,JSON.stringify(users))}catch(e){}};
let me=null;try{me=users.find(u=>u.id===sessionStorage.getItem('achados-me'))||null}catch(e){}
const sha=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('achei:'+s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const navBtn=()=>{const n=notifs.filter(x=>!x.lida).length;$('area').textContent=me?'Olá, '+me.nome.split(' ')[0]+(n?' ('+n+')':''):'Área da escola'};
function area(msg){
  let h='';
  if(me){
    h=`<h2 style="margin:0 0 8px">Área da escola</h2><p style="margin:0">Logado como <b>${esc(me.nome)}</b> (${me.admin?'Administrador':esc(me.papel)}). Você pode marcar itens como "dono encontrado" ou "entregue" e excluir registros.</p>`;
    h+=`<h3 style="margin:18px 0 0">Avisos (É meu / Encontrei) (${notifs.filter(x=>!x.lida).length} novos)</h3><ul class="users">${notifs.length?notifs.map(n=>`<li><span>${n.lida?'':'<b>NOVO</b> · '}<b>${esc(n.quem)}</b> ${n.tipo==='enc'?`encontrou "${esc(n.nome)}" (está: ${esc(n.onde)})`:`confirmou que "${esc(n.nome)}" é dele(a)`} · ${esc(n.contato)} · ${esc(n.quando)}</span>${n.lida?'':`<button class="link" data-x="lida" data-n="${n.id}">Marcar lida</button>`}</li>`).join(''):'<li>Nenhum aviso ainda.</li>'}</ul>`;
    if(me.admin)h+=`<h3 style="margin:18px 0 0">Cadastrar funcionário ou aluno</h3>
      <label for="un">Nome</label><input id="un" maxlength="50">
      <div class="two"><div><label for="up">Perfil</label><select id="up"><option>Funcionário</option><option>Aluno</option></select></div><div><label for="um">Matrícula / usuário</label><input id="um" maxlength="20"></div></div>
      <label for="us">PIN (mín. 4 dígitos)</label><div class="pw"><input id="us" type="password" inputmode="numeric" maxlength="12"><button type="button" class="eye" data-x="eye" aria-label="Mostrar ou ocultar PIN">👁</button></div>
      <button class="btn" style="margin-top:10px" data-x="add">Cadastrar</button>
      <ul class="users">${users.map(u=>`<li><span><b>${esc(u.nome)}</b> · ${u.admin?'Administrador':esc(u.papel)} · ${esc(u.mat)}</span>${u.admin?'':`<button class="link" data-x="rm" data-u="${u.id}">Remover</button>`}</li>`).join('')}</ul>`;
    h+=`<p class="msg">${msg||''}</p><div class="row"><button class="link" data-x="out">Sair</button><button class="btn" data-x="fechar">Fechar</button></div>`;
  }else{
    const first=!users.length;
    h=`<h2 style="margin:0 0 8px">${first?'Primeiro acesso':'Entrar'}</h2><p style="margin:0" class="hint">${first?'Crie o administrador da escola. Ele poderá cadastrar funcionários e alunos autorizados.':'Acesso restrito a funcionários e alunos cadastrados.'}</p>
      ${first?'<label for="un">Nome do administrador</label><input id="un" maxlength="50">':''}
      <label for="um">Matrícula / usuário</label><input id="um" maxlength="20" autocomplete="username">
      <label for="us">PIN</label><div class="pw"><input id="us" type="password" inputmode="numeric" maxlength="12" autocomplete="current-password"><button type="button" class="eye" data-x="eye" aria-label="Mostrar ou ocultar PIN">👁</button></div>
      <p class="msg">${msg||''}</p>
      <div class="row"><button class="link" data-x="fechar">Cancelar</button><button class="btn" data-x="${first?'setup':'login'}">${first?'Criar administrador':'Entrar'}</button></div>`;
  }
  $('abody').innerHTML=h;navBtn();
}
$('area').onclick=()=>{area();$('dlg2').showModal()};
$('abody').addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  const x=b.dataset.x,v=id=>($(id)?$(id).value.trim():'');
  if(x==='eye'){const p=$('us');p.type=p.type==='password'?'text':'password';b.textContent=p.type==='password'?'👁':'🙈';return}
  if(x==='fechar')return $('dlg2').close();
  if(x==='out'){me=null;try{sessionStorage.removeItem('achados-me')}catch(_){}area();render();return}
  if(x==='lida'){const n=notifs.find(n=>n.id===b.dataset.n);if(n)n.lida=true;saveN();return area()}
  if(x==='rm'){users=users.filter(u=>u.id!==b.dataset.u);saveU();return area('Cadastro removido.')}
  const mat=v('um').toLowerCase(),pin=v('us');
  if(x==='login'){
    const h=await sha(pin),u=users.find(u=>u.mat.toLowerCase()===mat&&u.pin===h);
    if(!u)return area('Usuário ou PIN incorretos.');
    me=u;try{sessionStorage.setItem('achados-me',u.id)}catch(_){}area();render();return}
  if(!mat||pin.length<4||!v('un'))return area('Preencha todos os campos. O PIN precisa ter ao menos 4 dígitos.');
  if(users.some(u=>u.mat.toLowerCase()===mat))return area('Essa matrícula já está cadastrada.');
  if(x==='setup'||(x==='add'&&me&&me.admin)){
    const u={id:'u'+Date.now(),nome:v('un'),papel:x==='setup'?'Funcionário':$('up').value,mat:v('um'),pin:await sha(pin),admin:x==='setup'};
    users.push(u);saveU();
    if(x==='setup'){me=u;try{sessionStorage.setItem('achados-me',u.id)}catch(_){}area();render()}
    else area('Cadastrado: '+esc(u.nome)+'.');
  }
});

const norm = s => String(s || "")
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^\w\s]/g, "")
  .trim()
  .replace(/\s+/g, " ");

function distanciaEdicao(a, b) {
  const matriz = Array.from(
    { length: a.length + 1 },
    () => Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matriz[i][0] = i;
  for (let j = 0; j <= b.length; j++) matriz[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;

      matriz[i][j] = Math.min(
        matriz[i - 1][j] + 1,
        matriz[i][j - 1] + 1,
        matriz[i - 1][j - 1] + custo
      );
    }
  }

  return matriz[a.length][b.length];
}

const okr = (a, b, l) => {
  a = norm(a);
  b = norm(b);

  if (!a || !b) return false;
  if (a === b) return true;

  if (l && a.length >= 3 && (b.includes(a) || a.includes(b))) {
    return true;
  }

  if (a.length < 4 || b.length < 4) return false;

  const distancia = distanciaEdicao(a, b);
  const tamanho = Math.max(a.length, b.length);

  const limite = tamanho <= 6 ? 1 : Math.floor(tamanho * 0.18);

  return distancia <= limite;
};

let meuId=null;const tries={};
const qs=i=>{const q=[];if(i.perg)q.push({t:i.perg,a:i.resp,l:0});if(i.cor)q.push({t:'Qual é a cor principal do objeto?',a:i.cor,l:1});if(i.marca)q.push({t:'Qual é a marca do objeto?',a:i.marca,l:1});q.push({t:'Em que local você perdeu o objeto?',a:i.local,l:1});return q};
function abrirMeu(id){
  meuId=id;const i=itens.find(x=>x.id===id);
  $('mbody').innerHTML=`<h2 style="margin:0 0 4px">É meu</h2><p class="hint" style="margin:0">Responda para confirmar que o objeto é seu: <b>${esc(i.nome)}</b>. Quando confirmado, a equipe da escola é avisada.</p>
  <label for="mn">Seu nome</label><input id="mn" maxlength="50"><label for="mc">Seu contato</label><input id="mc" maxlength="60" placeholder="Telefone ou e-mail">
  ${qs(i).map((q,k)=>`<label for="mq${k}">${esc(q.t)}</label><input id="mq${k}" maxlength="60">`).join('')}
  <p class="msg" id="mmsg"></p><div class="row"><button class="link" data-y="f">Cancelar</button><button class="btn" data-y="ok">Confirmar</button></div>`;
  $('dlg3').showModal()}
$('mbody').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.y==='f')return $('dlg3').close();
  if(b.dataset.y==='enc'){
    const i=itens.find(x=>x.id===meuId),n=$('en').value.trim(),c=$('ec').value.trim(),o=$('eo').value.trim();
    if(!n||!c||!o){$('mmsg').textContent='Preencha nome, contato e onde está o objeto.';return}
    if(i.st==='aberto')i.st='encontrado';save();
    notifs.unshift({id:'n'+Date.now(),nome:i.nome,quem:n,contato:c,quando:new Date().toLocaleString('pt-BR'),lida:false,tipo:'enc',onde:o});saveN();render();navBtn();
    $('mbody').innerHTML='<h2 style="margin:0 0 6px">Obrigado!</h2><p>A equipe foi avisada e vai entrar em contato com você e com o dono.</p><button class="btn" data-y="f">Fechar</button>';return}
  if(b.dataset.y!=='ok')return;
  const i=itens.find(x=>x.id===meuId),nome=$('mn').value.trim(),ct=$('mc').value.trim(),m=t=>{$('mmsg').textContent=t};
  if((tries[meuId]||0)>=3)return m('Muitas tentativas. Procure a secretaria da escola.');
  if(!nome||!ct)return m('Informe seu nome e contato.');
  if(!qs(i).every((q,k)=>okr($('mq'+k).value,q.a,q.l))){tries[meuId]=(tries[meuId]||0)+1;return m(tries[meuId]>=3?'Muitas tentativas. Procure a secretaria da escola.':'Alguma resposta não confere. Tente de novo.')}
  unlocked.add(i.id);if(i.st==='aberto')i.st='dono';save();
  notifs.unshift({id:'n'+Date.now(),nome:i.nome,quem:nome,contato:ct,quando:new Date().toLocaleString('pt-BR'),lida:false});saveN();
  render();navBtn();
  $('mbody').innerHTML=`<h2 style="margin:0 0 6px">Confirmado!</h2><p>Funcionários e alunos cadastrados foram avisados. Contato de quem achou: <b>${esc(i.contato)}</b></p><button class="btn" data-y="f">Fechar</button>`;
});
let fotoAtual=null;
$('foto').addEventListener('change',e=>{
  const f=e.target.files[0];fotoAtual=null;$('prev').style.display='none';if(!f)return;
  const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{
    const k=Math.min(1,640/Math.max(im.width,im.height)),c=document.createElement('canvas');
    c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);
    fotoAtual=c.toDataURL('image/jpeg',.72);$('prev').src=fotoAtual;$('prev').style.display='block'};im.src=r.result};r.readAsDataURL(f)});
function abrirEnc(id){
  meuId=id;const i=itens.find(x=>x.id===id);
  $('mbody').innerHTML=`<h2 style="margin:0 0 4px">Encontrei</h2><p class="hint" style="margin:0">Você achou "${esc(i.nome)}"? Informe seus dados. A equipe da escola será avisada.</p>
  <label for="en">Seu nome</label><input id="en" maxlength="50"><label for="ec">Seu contato</label><input id="ec" maxlength="60" placeholder="Telefone ou e-mail">
  <label for="eo">Onde o objeto está agora?</label><input id="eo" maxlength="60" placeholder="Ex.: na portaria">
  <p class="msg" id="mmsg"></p><div class="row"><button class="link" data-y="f">Cancelar</button><button class="btn" data-y="enc">Avisar</button></div>`;
  $('dlg3').showModal()}
navBtn();
render();