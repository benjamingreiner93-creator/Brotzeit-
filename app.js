'use strict';
const $=id=>document.getElementById(id);
const defaults=[
{id:'ciabatta',name:'Ciabatta',flours:[{name:'Weizenmehl Type 550',pct:100}],water:75,salt:2,extras:[],steps:['Zutaten vermischen und 20 Minuten ruhen lassen.','5–8 Minuten langsam kneten. Während der ersten 90 Minuten der warmen Teigruhe dreimal im Abstand von 30 Minuten dehnen und falten.','Die Stockgare abgedeckt fortsetzen. Der Teig soll sichtbar aufgehen und Blasen zeigen.','Teig vorsichtig auf eine bemehlte Fläche geben, teilen und möglichst wenig entgasen.','Bis zur passenden Stückgare ruhen lassen und heiß mit Dampf backen.'],bake:'240 °C, etwa 20–25 Minuten'},
{id:'focaccia',name:'Focaccia',flours:[{name:'Weizenmehl Type 550',pct:100}],water:80,salt:2,extras:[{name:'Olivenöl im Teig',pct:4}],steps:['Zutaten vermischen; das Olivenöl zuletzt einarbeiten.','Während der ersten 90 Minuten der warmen Teigruhe dreimal im Abstand von 30 Minuten dehnen und falten.','Die Stockgare abgedeckt fortsetzen. Der Teig soll luftig werden und sichtbar aufgehen.','In eine großzügig geölte Form geben und behutsam ausziehen.','Gut aufgehen lassen, mit geölten Fingern Vertiefungen eindrücken und mit Olivenöl, Rosmarin und grobem Salz belegen.'],bake:'230 °C Ober-/Unterhitze, etwa 20–30 Minuten'},
{id:'italian',name:'Italienisches Landbrot',flours:[{name:'Weizenmehl Type 550',pct:100}],water:70,salt:2,extras:[],steps:['Zutaten mischen und 20 Minuten ruhen lassen.','6–8 Minuten kneten. Während der ersten Stunde der warmen Teigruhe nach 30 und 60 Minuten dehnen und falten.','Abgedeckt reifen lassen.','Schonend rund formen und bis zur passenden Stückgare gehen lassen.','Mit Dampf anbacken.'],bake:'240 °C anbacken, dann 210 °C, insgesamt 35–45 Minuten'},
{id:'wheat',name:'Weizenbrot',flours:[{name:'Weizenmehl Type 550',pct:100}],water:68,salt:2,extras:[],steps:['Zutaten gründlich vermischen.','8–10 Minuten kneten, bis ein elastischer Teig entsteht.','Abgedeckt reifen lassen.','Formen und zur passenden Stückgare bringen.','Mit Dampf backen.'],bake:'230 °C anbacken, dann 200 °C, insgesamt 35–45 Minuten'},
{id:'mixed',name:'Weizen-Roggen-Mischbrot',flours:[{name:'Weizenmehl Type 550',pct:70},{name:'Roggenmehl Type 1150',pct:30}],water:70,salt:2,extras:[],steps:['Alle Zutaten gründlich mischen.','Etwa 5–7 Minuten langsam kneten.','Abgedeckt reifen lassen.','Mit leicht bemehlten Händen formen und zur Stückgare bringen.','Mit Dampf backen. Hinweis: Ohne Sauerteig ist das kein klassisch gesäuertes Roggenmischbrot.'],bake:'240 °C anbacken, dann 200 °C, insgesamt 40–50 Minuten'}];
const baseIds=new Set(defaults.map(r=>r.id));
// Stockgare in Stunden, Trockenhefe in g pro 500 g Mehl, übrige Zeiten in Minuten.
const timing={
  ciabatta:{cold:{hours:16,dry:1.4,start:90,proof:45},room:{hours:2.5,dry:3.5,start:0,proof:45},prep:30,bake:25,preheat:30},
  focaccia:{cold:{hours:18,dry:1.5,start:90,proof:120},room:{hours:2,dry:4,start:0,proof:90},prep:25,bake:25,preheat:30},
  italian:{cold:{hours:16,dry:1.4,start:60,proof:75},room:{hours:2.5,dry:3.5,start:0,proof:60},prep:30,bake:40,preheat:35},
  wheat:{cold:{hours:14,dry:1.5,start:45,proof:60},room:{hours:2,dry:4,start:0,proof:60},prep:25,bake:40,preheat:30},
  mixed:{cold:{hours:12,dry:1.5,start:30,proof:60},room:{hours:2,dry:4,start:0,proof:45},prep:25,bake:45,preheat:35}
};
const genericTiming={
  cold:{hours:14,dry:1.5,start:60,proof:75},
  room:{hours:2.5,dry:3.5,start:0,proof:60},
  prep:30,bake:40,preheat:30
};
const recipeTiming=id=>Object.hasOwn(timing,id)?timing[id]:genericTiming;
const fermentation=(id,mode)=>recipeTiming(id)[mode];
const minutesLabel=minutes=>minutes>=60&&minutes%60===0
  ? `${minutes/60} Std.` : `${minutes} Min.`;
function resetHours(){
  $('hours').value=fermentation(current().id,$('temperature').value).hours;
}
function recipeSelectionChanged(){
  resetHours();
  calculate();
  $('planRecipe').value=current().id;
  planDefaults();
}
const clone=x=>JSON.parse(JSON.stringify(x));
let recipes;try{const v=JSON.parse(localStorage.getItem('brotzeit-recipes'));recipes=Array.isArray(v)?v:clone(defaults)}catch{recipes=clone(defaults)}
const normalizeLibrary=()=>{const extras=recipes.filter(r=>r&&!baseIds.has(r.id));recipes=[...clone(defaults),...extras]};normalizeLibrary();
const save=()=>localStorage.setItem('brotzeit-recipes',JSON.stringify(recipes));
const backupKey='brotzeit-settings';
const num=(v,min,max)=>Math.min(max,Math.max(min,Number(v)||min));
const fmt=v=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:v<10?2:0}).format(v);
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function validate(r){if(!r||typeof r.name!=='string'||!r.name.trim()||r.name.length>120||!Array.isArray(r.flours)||!r.flours.length||r.flours.length>20)throw Error('Ungültiger Rezeptname oder Mehlmischung');const sum=r.flours.reduce((a,x)=>{if(!x||typeof x.name!=='string'||!Number.isFinite(Number(x.pct))||Number(x.pct)<=0)throw Error('Ungültiger Mehlanteil');return a+Number(x.pct)},0);if(Math.abs(sum-100)>.05)throw Error('Mehlanteile müssen zusammen 100 % ergeben');for(const key of ['water','salt'])if(!Number.isFinite(Number(r[key]))||Number(r[key])<0||Number(r[key])>150)throw Error('Ungültiger Wert: '+key);if(!Array.isArray(r.extras)||r.extras.length>30||r.extras.some(x=>typeof x.name!=='string'||!Number.isFinite(Number(x.pct))||Number(x.pct)<0||Number(x.pct)>150))throw Error('Ungültige Zusatzzutaten');if(!Array.isArray(r.steps)||r.steps.length>50||r.steps.some(x=>typeof x!=='string'))throw Error('Ungültige Schritte');if(typeof r.bake!=='string')throw Error('Ungültiger Backhinweis');return {...r,id:String(r.id||crypto.randomUUID()),name:r.name.trim(),flours:r.flours.map(x=>({name:String(x.name),pct:Number(x.pct)})),water:Number(r.water),salt:Number(r.salt),extras:r.extras.map(x=>({name:String(x.name),pct:Number(x.pct)}))};}
function updateSelect(){const previous=$('recipeSelect').value;$('recipeSelect').innerHTML='';recipes.forEach(r=>{const o=document.createElement('option');o.value=r.id;o.textContent=r.name;$('recipeSelect').append(o)});if(recipes.some(r=>r.id===previous))$('recipeSelect').value=previous;else resetHours();syncPlannerSelect();calculate();renderList()}
function current(){return recipes.find(r=>r.id===$('recipeSelect').value)||recipes[0]}
function calculate(){const r=current();if(!r)return;const flour=num($('flour').value,100,10000),hours=num($('hours').value,2,72),cold=$('temperature').value==='cold';const profile=fermentation(r.id,$('temperature').value);const dry=flour/500*profile.dry*Math.pow(profile.hours/hours,cold?.75:1.25);const yeast=dry*($('yeastType').value==='fresh'?3:1);const entries=[...r.flours.map(x=>[x.name,flour*x.pct/100]),['Wasser',flour*r.water/100],['Salz',flour*r.salt/100],...r.extras.map(x=>[x.name,flour*x.pct/100]),[$('yeastType').value==='fresh'?'Frischhefe (Schätzwert)':'Trockenhefe (Schätzwert)',yeast]];$('ingredients').innerHTML=entries.map(([name,value])=>`<div class="row"><span>${escapeHTML(name)}</span><strong>${fmt(value)} g</strong></div>`).join('');$('hydration').textContent=`Hydration: ${r.water} % · Salz: ${r.salt} %`; const stock=`${fmt(hours)} Std. ${cold?'bei 4–5 °C':'bei 20–22 °C'}`;
const schedule=`${cold?minutesLabel(profile.start)+' bei Raumtemperatur vor der Kühlschrankgare · ':''}Stockgare: ${stock} · Stückgare: ca. ${minutesLabel(profile.proof)} bei Raumtemperatur`;
$('fermentationInfo').textContent=schedule;
$('steps').innerHTML=r.steps.map(s=>`<li>${escapeHTML(s)}</li>`).join('');$('bakeInfo').textContent='Backen: '+r.bake;window.lastRecipeText=`${r.name}\n`+entries.map(x=>`${x[0]}: ${fmt(x[1])} g`).join('\n')+`\n${schedule}\n`+r.steps.map((s,i)=>`${i+1}. ${s}`).join('\n')+`\nBacken: ${r.bake}\nHefemenge nur als Richtwert.`}
function renderList(){$('recipeList').innerHTML=recipes.map(r=>`<div class="recipe"><strong>${escapeHTML(r.name)}</strong><div class="muted">${r.water} % Wasser · ${r.flours.length} Mehlsorte(n)</div><button class="secondary" data-use="${escapeHTML(r.id)}">Berechnen</button>${baseIds.has(r.id)?'<span class="pill">Grundrezept · geschützt</span>':`<button class="secondary" data-edit="${escapeHTML(r.id)}">Bearbeiten</button><button class="danger" data-delete="${escapeHTML(r.id)}">Löschen</button>`}</div>`).join('')}
function openEditor(id){if(baseIds.has(id)){alert('Grundrezepte sind geschützt. Du kannst eine eigene Variante importieren oder anlegen.');return}const r=recipes.find(x=>x.id===id);$('editor').classList.remove('hidden');$('editorTitle').textContent=r?'Rezept bearbeiten':'Neues Rezept';$('editId').value=r?.id||'';$('editName').value=r?.name||'';$('editFlours').value=r?.flours.map(x=>`${x.name}|${x.pct}`).join('\n')||'Weizenmehl Type 550|100';$('editWater').value=r?.water??70;$('editSalt').value=r?.salt??2;$('editExtras').value=r?.extras.map(x=>`${x.name}|${x.pct}`).join('\n')||'';$('editSteps').value=r?.steps.join('\n')||'';$('editBake').value=r?.bake||'';$('editor').scrollIntoView({behavior:'smooth'})}
function parseLines(v){return v.split('\n').filter(x=>x.trim()).map(line=>{const i=line.lastIndexOf('|');if(i<1)throw Error('Format: Name|Prozent');return{name:line.slice(0,i).trim(),pct:Number(line.slice(i+1).trim().replace(',','.'))}})}
function saveEditor(){try{if(baseIds.has($('editId').value))throw Error('Grundrezepte sind geschützt');const id=$('editId').value||crypto.randomUUID();const r=validate({id,name:$('editName').value,flours:parseLines($('editFlours').value),water:Number($('editWater').value),salt:Number($('editSalt').value),extras:parseLines($('editExtras').value),steps:$('editSteps').value.split('\n').map(x=>x.trim()).filter(Boolean),bake:$('editBake').value});const i=recipes.findIndex(x=>x.id===id);if(i>=0)recipes[i]=r;else recipes.push(r);save();$('editor').classList.add('hidden');updateSelect();$('recipeSelect').value=id;recipeSelectionChanged()}catch(e){alert(e.message)}}
function download(name,data){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
function syncPlannerSelect(){const el=$('planRecipe');const old=el.value;el.innerHTML=recipes.map(r=>`<option value="${escapeHTML(r.id)}">${escapeHTML(r.name)}</option>`).join('');el.value=recipes.some(r=>r.id===old)?old:($('recipeSelect').value||'ciabatta')}
function planDefaults(useCalculatorHours=false){
  const id=$('planRecipe').value;
  const t=recipeTiming(id);
  const profile=t[$('temperature').value];
  $('planRest').value=useCalculatorHours&&id===current().id?$('hours').value:profile.hours;
  $('planBake').value=t.bake;
  $('planPrep').value=t.prep;
  $('planProof').value=profile.proof;
  $('planWarm').value=0;
  $('planStartWarm').value=profile.start;
  $('planPreheat').value=t.preheat;
  $('planResult').classList.add('hidden');
  savePlannerSettings();
}
function savePlannerSettings(){const v={};for(const id of ['planRecipe','planRest','planBake','planPrep','planProof','planWarm','planStartWarm','planPreheat','finishAt'])v[id]=$(id).value;localStorage.setItem(backupKey,JSON.stringify(v))}
function dateLocal(d){return d.toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short'})}
function plan(){const end=new Date($('finishAt').value);if(isNaN(end.getTime())){alert('Bitte eine gültige Fertigstellungszeit eingeben.');return}const bake=num($('planBake').value,5,180),proof=num($('planProof').value,0,360),rest=num($('planRest').value,2,72)*60,prep=num($('planPrep').value,0,180),warm=num($('planWarm').value,0,360),startWarm=num($('planStartWarm').value,0,240),preheat=num($('planPreheat').value,0,120);let t=end.getTime();const rows=[['Brot fertig',new Date(t)]];t-=bake*60000;const bakeStart=t;rows.push(['Backen beginnen',new Date(t)]);rows.push(['Ofen vorheizen (parallel zur letzten Gare)',new Date(bakeStart-preheat*60000)]);t-=proof*60000;rows.push(['Formen / Stückgare beginnen',new Date(t)]);t-=warm*60000;if(warm)rows.push(['Teig aus Kühlschrank nehmen / warmwerden lassen',new Date(t)]);t-=rest*60000;rows.push(['Stockgare / Teigruhe beginnen',new Date(t)]);t-=startWarm*60000;if(startWarm)rows.push(['Teig bei Raumtemperatur anspringen lassen',new Date(t)]);t-=prep*60000;rows.push(['Zutaten vorbereiten',new Date(t)]);rows.sort((a,b)=>a[1]-b[1]);$('planResult').innerHTML='<h2>Dein Zeitplan</h2>'+rows.map(([s,d])=>`<div class="row"><span>${escapeHTML(s)}</span><strong>${dateLocal(d)}</strong></div>`).join('')+'<p class="muted">Ofenvorheizen läuft parallel zur letzten Gare. Die Temperaturangleichung ist ein eigener Schritt; bei vielen Teigen kann sie mit der Stückgare überlappen. Zeitangaben sind Richtwerte – Volumen und Teigzustand entscheiden.</p>';$('planResult').classList.remove('hidden');savePlannerSettings()}

for(const b of document.querySelectorAll('nav button'))b.addEventListener('click',()=>{document.querySelectorAll('section').forEach(s=>s.classList.toggle('active',s.id===b.dataset.tab));document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x===b));window.scrollTo(0,0)});
for(const id of ['flour','hours','yeastType'])$(id).addEventListener('input',calculate);
$('recipeSelect').addEventListener('change',recipeSelectionChanged);
$('temperature').addEventListener('change',()=>{
  resetHours();
  calculate();
  planDefaults();
});
$('hours').addEventListener('change',()=>{
  if($('planRecipe').value===current().id){
    $('planRest').value=num($('hours').value,2,72);
    $('planResult').classList.add('hidden');
    savePlannerSettings();
  }
});
$('copyRecipe').onclick=async()=>{try{await navigator.clipboard.writeText(window.lastRecipeText);alert('Rezept kopiert')}catch{alert('Kopieren nicht verfügbar.')}};
$('newRecipe').onclick=()=>openEditor();$('cancelEdit').onclick=()=>$('editor').classList.add('hidden');$('saveRecipe').onclick=saveEditor;
$('recipeList').onclick=e=>{const b=e.target.closest('button');if(!b)return;const id=b.dataset.use||b.dataset.edit||b.dataset.delete;if(b.dataset.use){$('recipeSelect').value=id;recipeSelectionChanged();document.querySelector('nav button[data-tab="calculator"]').click()}else if(b.dataset.edit)openEditor(id);else if(b.dataset.delete&&!baseIds.has(id)&&confirm('Rezept wirklich löschen?')){recipes=recipes.filter(r=>r.id!==id);normalizeLibrary();save();updateSelect()}};
$('planButton').onclick=plan;$('planRecipe').onchange=() => planDefaults(true);$('planDefaults').onclick=() => planDefaults(true);for(const id of ['planRest','planBake','planPrep','planProof','planWarm','planStartWarm','planPreheat','finishAt'])$(id).addEventListener('change',savePlannerSettings);$('exportButton').onclick=()=>download('brotzeit-rezepte.json',{version:2,recipes:recipes.filter(r=>!baseIds.has(r.id))});
function fullBackup(){let settings={};try{settings=JSON.parse(localStorage.getItem(backupKey)||'{}')}catch{}return{format:'brotzeit-backup',version:2,createdAt:new Date().toISOString(),recipes:clone(recipes.filter(r=>!baseIds.has(r.id))),settings}}
$('backupButton').onclick=()=>{download('brotzeit-backup-'+new Date().toISOString().slice(0,10)+'.json',fullBackup());$('backupStatus').textContent='Backup heruntergeladen. Speichere die Datei in iCloud Drive oder einem anderen sicheren Ort.'};
$('restoreFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>2*1024*1024)throw Error('Datei zu groß');const obj=JSON.parse(await file.text());if(obj.format!=='brotzeit-backup'||obj.version!==2||!Array.isArray(obj.recipes)||obj.recipes.length>500)throw Error('Keine gültige Brotzeit-Sicherungsdatei');const incoming=obj.recipes.map(validate);if(!obj.settings||typeof obj.settings!=='object'||Array.isArray(obj.settings))throw Error('Ungültige Einstellungen');if(!confirm('Die aktuellen eigenen Rezepte und Planer-Einstellungen werden ersetzt. Fortfahren?'))return;download('brotzeit-sicherung-vor-wiederherstellung.json',fullBackup());const ids=new Set(baseIds);for(const r of incoming){if(ids.has(r.id))r.id=crypto.randomUUID();ids.add(r.id)}recipes=[...clone(defaults),...incoming];save();localStorage.setItem(backupKey,JSON.stringify(obj.settings));updateSelect();restorePlannerSettings();$('backupStatus').textContent=`Backup wiederhergestellt: ${incoming.length} eigene Rezepte.`}catch(err){$('backupStatus').textContent='Wiederherstellung fehlgeschlagen: '+err.message}finally{e.target.value=''}};
function restorePlannerSettings(){let v;try{v=JSON.parse(localStorage.getItem(backupKey)||'null')}catch{}if(v&&typeof v==='object'){for(const id of ['planRecipe','planRest','planBake','planPrep','planProof','planWarm','planStartWarm','planPreheat','finishAt'])if(v[id]!=null&&$(id))$(id).value=String(v[id]);if(!recipes.some(r=>r.id===$('planRecipe').value))$('planRecipe').value='ciabatta'}else{planDefaults()}}$('exampleButton').onclick=()=>download('brotzeit-beispiel.json',{version:1,recipes:[defaults[1]]});
$('importFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>1024*1024)throw Error('Datei zu groß (max. 1 MB)');const parsed=JSON.parse(await file.text());const incoming=Array.isArray(parsed)?parsed:parsed.recipes;if(!Array.isArray(incoming)||!incoming.length||incoming.length>100)throw Error('Erwartet wird eine Liste mit 1–100 Rezepten');const valid=incoming.map(validate);for(const r of valid){const index=recipes.findIndex(x=>x.id===r.id);if(index>=0||baseIds.has(r.id)){r.id=crypto.randomUUID()}recipes.push(r)}save();updateSelect();$('importStatus').textContent=`${valid.length} Rezept(e) importiert.`}catch(err){$('importStatus').textContent='Import fehlgeschlagen: '+err.message}e.target.value=''};
$('resetButton').onclick=()=>{if(confirm('Eigene Rezepte und Einstellungen löschen? Bitte vorher ein Backup erstellen.')){recipes=clone(defaults);localStorage.removeItem(backupKey);save();updateSelect();recipeSelectionChanged()}};
const soon=new Date(Date.now()+24*3600000);soon.setMinutes(0,0,0);const pad=n=>String(n).padStart(2,'0');$('finishAt').value=`${soon.getFullYear()}-${pad(soon.getMonth()+1)}-${pad(soon.getDate())}T${pad(soon.getHours())}:${pad(soon.getMinutes())}`;
updateSelect();resetHours();calculate();restorePlannerSettings();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
