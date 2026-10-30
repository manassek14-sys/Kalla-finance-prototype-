(()=>{
'use strict';
const KEY='kalla-finance-allocations-v1', FIN='kalla-finance-complete-v1';
const $=id=>document.getElementById(id), uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sum=a=>a.reduce((n,x)=>n+(Number(x.pct)||0),0);
function installPanel(){
 if($('allocationTablesPanel'))return;
 const anchor=$('investChart')?.closest('.panel');
 if(!anchor)return;
 const panel=document.createElement('article');
 panel.className='panel';panel.id='allocationTablesPanel';
 panel.innerHTML='<div class="panel-head allocation-main-head"><div><h2>Mes tableaux de répartition</h2><p class="sub">Crée, personnalise et suis autant de répartitions que nécessaire.</p></div><button class="primary" id="addAllocationTable">+ Ajouter un tableau</button></div><div id="allocationTablesList" class="allocation-grid"></div><p class="muted allocation-footnote">Ces tableaux sont enregistrés séparément des opérations financières. Chaque total doit être égal à 100 %.</p>';
 anchor.insertAdjacentElement('afterend',panel);
 const style=document.createElement('style');
 style.textContent=`
 .allocation-main-head{align-items:flex-start;flex-wrap:wrap}
 .allocation-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
 .allocation-card{background:#101a2d;border:1px solid var(--line);border-radius:14px;padding:15px;min-width:0}
 .allocation-card-head{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px}
 .allocation-title{flex:1;min-width:0;font-weight:750}
 .allocation-title input{font-weight:750}
 .allocation-overview{display:grid;grid-template-columns:100px minmax(0,1fr);gap:14px;align-items:center;margin:12px 0}
 .allocation-donut{width:96px;height:96px;border-radius:50%;position:relative;display:grid;place-items:center}
 .allocation-donut:after{content:"";position:absolute;inset:13px;border-radius:50%;background:#101a2d}
 .allocation-donut span{position:relative;z-index:1;font-size:.75rem;font-weight:800}
 .allocation-total{display:block;font-size:.75rem;color:var(--muted)}
 .allocation-total input{margin-top:4px}
 .allocation-category-head,.allocation-category{display:grid;grid-template-columns:minmax(0,1fr) 76px 92px 34px;gap:7px;align-items:center}
 .allocation-category-head{font-size:.68rem;color:var(--muted);padding:8px 0 5px}
 .allocation-category{padding:6px 0;border-top:1px solid var(--line)}
 .allocation-category input{padding:8px;font-size:.8rem}
 .allocation-category .allocation-amount{font-size:.76rem;text-align:right;overflow-wrap:anywhere}
 .allocation-category button{padding:6px;font-size:.75rem;color:var(--red)}
 .allocation-card-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:11px}
 .allocation-status{font-size:.76rem;font-weight:700}
 .allocation-status.good{color:var(--green)}
 .allocation-status.bad{color:var(--red)}
 .allocation-card-foot button{padding:8px 10px;font-size:.76rem}
 .allocation-footnote{margin:14px 0 0;font-size:.75rem}
 @media(max-width:680px){.allocation-grid{grid-template-columns:1fr}.allocation-card{padding:12px}.allocation-overview{grid-template-columns:86px minmax(0,1fr)}.allocation-donut{width:82px;height:82px}.allocation-category-head,.allocation-category{grid-template-columns:minmax(0,1fr) 62px 78px 30px;gap:5px}.allocation-category input{padding:7px 5px;font-size:.75rem}.allocation-category .allocation-amount{font-size:.7rem}.allocation-main-head button{width:100%}}
 `;
 document.head.appendChild(style);
}
function defaults(){
 let f={};try{f=JSON.parse(localStorage.getItem(FIN))||{}}catch(e){}
 let p=Number(f.profit)||1000000,m=f.main||[],s=f.sub||{};
 const categories=(a,b)=>a?.length?a.map(x=>({name:x.name,pct:Number(x.pct)||0})):b.map(([name,pct])=>({name,pct}));
 let invest=m.find(x=>x.id==='invest')?.pct??40,cash=m.find(x=>x.id==='cash')?.pct??25,salary=m.find(x=>x.id==='salary')?.pct??25;
 return [
  {title:'Répartition des bénéfices',amount:p,categories:categories(m,[['Dîme',10],['Salaire personnel',25],['Trésorerie entreprise',25],['Fonds d’investissement',40]])},
  {title:'Fonds d’investissement',amount:p*invest/100,categories:categories(s.invest,[['Business',35],['Immobilier',25],['Placements financiers',15],['Voyages',10],['Matériel',10],['Formations',5]])},
  {title:'Trésorerie',amount:p*cash/100,categories:categories(s.cash,[['Fonds de roulement',35],['Stock',20],['Charges et impôts',15],['Salaires et prestataires',10],['Urgence',10],['Maintenance',5],['Outils et logiciels',5]])},
  {title:'Budget personnel',amount:p*salary/100,categories:categories(s.salary,[['Vie courante',25],['Logement',18],['Voiture',8],['Mariage',8],['Maison à long terme',12],['Famille et imprévus',7],['Épargne de sécurité',5],['Détente',5],['Enfants',5],['Santé',7]])}
 ].map(t=>({...t,id:uid(),categories:t.categories.map(c=>({...c,id:uid()}))}));
}
let tables;try{tables=JSON.parse(localStorage.getItem(KEY));}catch(e){}
if(!Array.isArray(tables)||!tables.length){tables=defaults();localStorage.setItem(KEY,JSON.stringify(tables));}
const save=()=>localStorage.setItem(KEY,JSON.stringify(tables));
const currency=()=>{try{return JSON.parse(localStorage.getItem(FIN))?.currency||'FCFA'}catch(e){return 'FCFA'}};
function render(){
 const host=$('allocationTablesList');if(!host)return;
 host.innerHTML=tables.map(t=>{
  let total=sum(t.categories),pos=0;
  let stops=t.categories.map((c,i)=>{let a=pos;pos+=total>0?Math.max(0,Number(c.pct)||0)*100/total:0;return ['#d9b66f','#79ddb0','#86a9ff','#c49aff','#f09b87','#e6c16b','#68c6c9'][i%7]+' '+a+'% '+pos+'%'}).join(',');
  let rows=t.categories.map((c,i)=>'<div class="allocation-category"><input data-f="name" data-t="'+t.id+'" data-i="'+i+'" value="'+esc(c.name)+'" maxlength="70" aria-label="Nom de la catégorie"><input type="number" min="0" max="100" step="any" data-f="pct" data-t="'+t.id+'" data-i="'+i+'" value="'+(Number(c.pct)||0)+'" aria-label="Pourcentage"><span class="allocation-amount">'+((Number(t.amount)||0)*(Number(c.pct)||0)/100).toLocaleString('fr-FR',{maximumFractionDigits:2})+' '+currency()+'</span><button type="button" data-a="remove-cat" data-t="'+t.id+'" data-i="'+i+'" aria-label="Supprimer la catégorie">×</button></div>').join('');
  let balanced=Math.abs(total-100)<0.001;
  return '<section class="allocation-card"><div class="allocation-card-head"><label class="allocation-title">Nom du tableau<input data-f="title" data-t="'+t.id+'" value="'+esc(t.title)+'" maxlength="70"></label><button type="button" class="danger-btn" data-a="remove-table" data-t="'+t.id+'">Supprimer</button></div><div class="allocation-overview"><div class="allocation-donut" style="background:conic-gradient('+ (stops||'#344158 0% 100%') +')"><span>'+total.toFixed(1)+' %</span></div><label class="allocation-total">Montant de référence ('+currency()+')<input type="number" min="0" step="any" data-f="amount" data-t="'+t.id+'" value="'+(Number(t.amount)||0)+'"></label></div><div class="allocation-category-head"><span>Catégorie</span><span>%</span><span>Montant</span><span></span></div>'+rows+'<div class="allocation-card-foot"><span class="allocation-status '+(balanced?'good':'bad')+'">'+(balanced?'Total équilibré : 100 %':'Total : '+total.toFixed(2)+' % — ajuster à 100 %')+'</span><button type="button" data-a="add-cat" data-t="'+t.id+'">+ Catégorie</button></div></section>';
 }).join('');
}
function bind(){
 $('addAllocationTable')?.addEventListener('click',()=>{tables.push({id:uid(),title:'Nouvelle répartition',amount:0,categories:[{id:uid(),name:'Catégorie 1',pct:100}]});save();render();});
 $('allocationTablesList')?.addEventListener('click',e=>{
  let b=e.target.closest('[data-a]');if(!b)return;let t=tables.find(x=>x.id===b.dataset.t);if(!t)return;let i=Number(b.dataset.i);
  if(b.dataset.a==='add-cat')t.categories.push({id:uid(),name:'Nouvelle catégorie',pct:0});
  if(b.dataset.a==='remove-cat'){if(t.categories.length===1){alert('Conserve au moins une catégorie.');return;}t.categories.splice(i,1);}
  if(b.dataset.a==='remove-table'){if(!confirm('Supprimer ce tableau ?'))return;tables=tables.filter(x=>x.id!==t.id);}
  save();render();
 });
 $('allocationTablesList')?.addEventListener('change',e=>{
  let el=e.target.closest('[data-f]');if(!el)return;let t=tables.find(x=>x.id===el.dataset.t);if(!t)return;let i=Number(el.dataset.i),f=el.dataset.f;
  if(f==='title')t.title=el.value.trim()||'Répartition sans titre';
  if(f==='amount')t.amount=Math.max(0,Number(el.value)||0);
  if(f==='name'&&t.categories[i])t.categories[i].name=el.value.trim()||'Catégorie';
  if(f==='pct'&&t.categories[i])t.categories[i].pct=Math.max(0,Math.min(100,Number(el.value)||0));
  save();render();
 });
}
function start(){installPanel();if(!$('allocationTablesPanel'))return;bind();render();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();