'use strict';
const $=id=>document.getElementById(id);
const defaults=[
{id:'ciabatta',name:'Ciabatta',flourGrams:500,flours:[{name:'Weizenmehl Type 550',pct:100}],water:75,salt:2,extras:[],steps:['Zutaten vermischen und 20 Minuten ruhen lassen.','5–8 Minuten langsam kneten. Während der ersten 90 Minuten der warmen Teigruhe dreimal im Abstand von 30 Minuten dehnen und falten.','Die Stockgare abgedeckt fortsetzen. Der Teig soll sichtbar aufgehen und Blasen zeigen.','Teig vorsichtig auf eine bemehlte Fläche geben, teilen und möglichst wenig entgasen.','Bis zur passenden Stückgare ruhen lassen und heiß mit Dampf backen.'],bake:'240 °C, etwa 20–25 Minuten'},
{id:'focaccia',name:'Focaccia',flourGrams:500,flours:[{name:'Weizenmehl Type 550',pct:100}],water:80,salt:2,extras:[{name:'Olivenöl im Teig',pct:4/0.92,unit:'ml'}],steps:['Zutaten vermischen; das Olivenöl zuletzt einarbeiten.','Während der ersten 90 Minuten der warmen Teigruhe dreimal im Abstand von 30 Minuten dehnen und falten.','Die Stockgare abgedeckt fortsetzen. Der Teig soll luftig werden und sichtbar aufgehen.','In eine großzügig geölte Form geben und behutsam ausziehen.','Gut aufgehen lassen, mit geölten Fingern Vertiefungen eindrücken und mit Olivenöl, Rosmarin und grobem Salz belegen.'],bake:'230 °C Ober-/Unterhitze, etwa 20–30 Minuten'},
{id:'italian',name:'Italienisches Landbrot',flourGrams:500,flours:[{name:'Weizenmehl Type 550',pct:100}],water:70,salt:2,extras:[],steps:['Zutaten mischen und 20 Minuten ruhen lassen.','6–8 Minuten kneten. Während der ersten Stunde der warmen Teigruhe nach 30 und 60 Minuten dehnen und falten.','Abgedeckt reifen lassen.','Schonend rund formen und bis zur passenden Stückgare gehen lassen.','Mit Dampf anbacken.'],bake:'240 °C anbacken, dann 210 °C, insgesamt 35–45 Minuten'},
{id:'wheat',name:'Weizenbrot',flourGrams:500,flours:[{name:'Weizenmehl Type 550',pct:100}],water:68,salt:2,extras:[],steps:['Zutaten gründlich vermischen.','8–10 Minuten kneten, bis ein elastischer Teig entsteht.','Abgedeckt reifen lassen.','Formen und zur passenden Stückgare bringen.','Mit Dampf backen.'],bake:'230 °C anbacken, dann 200 °C, insgesamt 35–45 Minuten'},
{id:'mixed',name:'Weizen-Roggen-Mischbrot',flourGrams:500,flours:[{name:'Weizenmehl Type 550',pct:70},{name:'Roggenmehl Type 1150',pct:30}],water:70,salt:2,extras:[],steps:['Alle Zutaten gründlich mischen.','Etwa 5–7 Minuten langsam kneten.','Abgedeckt reifen lassen.','Mit leicht bemehlten Händen formen und zur Stückgare bringen.','Mit Dampf backen. Hinweis: Ohne Sauerteig ist das kein klassisch gesäuertes Roggenmischbrot.'],bake:'240 °C anbacken, dann 200 °C, insgesamt 40–50 Minuten'}];
const defaultFlourGrams=500;

function recipeFlourGrams(recipe){
  if(recipe.flourGrams!=null)return Number(recipe.flourGrams);
  // Older recipe exports sometimes only recorded the original amount in the steps.
  for(const step of recipe.steps){
    const match=step.match(/^Originalmenge für \d+ Brot(?:e)?: (\d+) g Gesamtmehl\b/);
    if(match){
      const grams=Number(match[1]);
      if(grams>=100&&grams<=10000)return grams;
    }
  }
  return defaultFlourGrams;
}

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
  $('planRecipe').value=current().id;
  planDefaults();
}
const clone=x=>JSON.parse(JSON.stringify(x));
let recipes;try{const v=JSON.parse(localStorage.getItem('brotzeit-recipes'));recipes=Array.isArray(v)?v:clone(defaults)}catch{recipes=clone(defaults)}
const normalizeLibrary=()=>{const extras=recipes.filter(r=>r&&!baseIds.has(r.id)).map(r=>({...r,flourGrams:recipeFlourGrams(r)}));recipes=[...clone(defaults),...extras]};normalizeLibrary();
const save=(nextRecipes=recipes)=>localStorage.setItem('brotzeit-recipes',JSON.stringify(nextRecipes));
const backupKey='brotzeit-settings';
const num=(v,min,max)=>Math.min(max,Math.max(min,Number(v)||min));
const fmt=v=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:v<10?2:0}).format(v);
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function validate(r){if(!r||typeof r.name!=='string'||!r.name.trim()||r.name.length>120||!Array.isArray(r.flours)||!r.flours.length||r.flours.length>20)throw Error('Ungültiger Rezeptname oder Mehlmischung');const sum=r.flours.reduce((a,x)=>{if(!x||typeof x.name!=='string'||!Number.isFinite(Number(x.pct))||Number(x.pct)<=0)throw Error('Ungültiger Mehlanteil');return a+Number(x.pct)},0);if(Math.abs(sum-100)>.05)throw Error('Mehlanteile müssen zusammen 100 % ergeben');for(const key of ['water','salt'])if(!Number.isFinite(Number(r[key]))||Number(r[key])<0||Number(r[key])>150)throw Error('Ungültiger Wert: '+key);if(!Array.isArray(r.extras)||r.extras.length>30||r.extras.some(x=>typeof x.name!=='string'||!Number.isFinite(Number(x.pct))||Number(x.pct)<0||Number(x.pct)>150))throw Error('Ungültige Zusatzzutaten');if(!Array.isArray(r.steps)||r.steps.length>50||r.steps.some(x=>typeof x!=='string'))throw Error('Ungültige Schritte');if(typeof r.bake!=='string')throw Error('Ungültiger Backhinweis');const flourGrams=recipeFlourGrams(r);if(!Number.isInteger(flourGrams)||flourGrams<100||flourGrams>10000)throw Error('Die Gesamtmehlmenge muss zwischen 100 und 10.000 g liegen.');const warmMinutes=Number(r.warmMinutes??0);if(!Number.isInteger(warmMinutes)||warmMinutes<0||warmMinutes>360)throw Error('Die Aufwärmzeit muss zwischen 0 und 360 Minuten liegen.');return {...r,flourGrams,warmMinutes,id:String(r.id||crypto.randomUUID()),name:r.name.trim(),flours:r.flours.map(x=>({name:String(x.name),pct:Number(x.pct)})),water:Number(r.water),salt:Number(r.salt),extras:r.extras.map(x=>({name:String(x.name),pct:Number(x.pct),...(x.unit==='ml'?{unit:'ml'}:{})}))};}
function updateSelect(){const previous=$('recipeSelect').value;$('recipeSelect').innerHTML='';recipes.forEach(r=>{const o=document.createElement('option');o.value=r.id;o.textContent=r.name;$('recipeSelect').append(o)});if(recipes.some(r=>r.id===previous))$('recipeSelect').value=previous;else resetHours();const previousPlan=$('planRecipe').value;syncPlannerSelect();if(previousPlan&&previousPlan!==$('planRecipe').value)planDefaults();else if(previous&&previous!==current().id){if(samePlan())$('hours').value=$('planRest').value;savePlannerSettings()}calculate();renderList()}
function current(){return recipes.find(r=>r.id===$('recipeSelect').value)||recipes[0]}
function calculate(){const r=current();if(!r)return;const flour=r.flourGrams;
$('flour').textContent=fmt(flour)+' g';
const hours=num($('hours').value,2,72),cold=$('temperature').value==='cold';const profile=fermentation(r.id,$('temperature').value);const dry=flour/500*profile.dry*Math.pow(profile.hours/hours,cold?.75:1.25);const yeast=dry*($('yeastType').value==='fresh'?3:1);const entries=[...r.flours.map(x=>[x.name,flour*x.pct/100]),['Wasser',flour*r.water/100,'ml'],['Salz',flour*r.salt/100],...r.extras.map(x=>[x.name,flour*x.pct/100,x.unit]),[$('yeastType').value==='fresh'?'Frischhefe (Schätzwert)':'Trockenhefe (Schätzwert)',yeast]];$('ingredients').innerHTML=entries.map(([name,value,unit])=>`<div class="row"><span>${escapeHTML(name)}</span><strong>${formatAmount(value)} ${unit??'g'}</strong></div>`).join('');$('hydration').textContent=`Hydration: ${formatAmount(r.water)} % · Salz: ${formatAmount(r.salt)} %`; const stock=`${fmt(hours)} Std. ${cold?'bei 4–5 °C':'bei 20–22 °C'}`;
const warm=cold?Number(r.warmMinutes)||0:0;
const schedule=`${cold?minutesLabel(profile.start)+' bei Raumtemperatur vor der Kühlschrankgare · ':''}Stockgare: ${stock} · ${warm?minutesLabel(warm)+' vor dem Formen warmwerden lassen · ':''}Stückgare: ca. ${minutesLabel(profile.proof)} bei Raumtemperatur`;
$('fermentationInfo').textContent=schedule;
$('steps').innerHTML=r.steps.map(s=>`<li>${escapeHTML(s)}</li>`).join('');$('bakeInfo').textContent='Backen: '+r.bake;window.lastRecipeText=`${r.name}\n`+entries.map(x=>`${x[0]}: ${formatAmount(x[1])} ${x[2]??'g'}`).join('\n')+`\n${schedule}\n`+r.steps.map((s,i)=>`${i+1}. ${s}`).join('\n')+`\nBacken: ${r.bake}\nHefemenge nur als Richtwert.`}
const amountLabel=new Intl.NumberFormat('de-DE',{maximumFractionDigits:2});
const formatAmount=value=>amountLabel.format(value);
const amountFromPercent=(flour,pct)=>Number((flour*pct/100).toPrecision(14));

function renderList(openId){
  $('recipeList').innerHTML=recipes.map(recipe=>{
    const id=escapeHTML(recipe.id);
    const isBase=baseIds.has(recipe.id);
    return `<details class="recipe"${recipe.id===openId?' open':''}>
      <summary><strong>${escapeHTML(recipe.name)}</strong><span class="muted">${formatAmount(recipe.flourGrams)} g Mehl · ${formatAmount(recipe.water)} % Hydration</span></summary>
      <button class="secondary" data-use="${id}">Im Rechner öffnen</button>
      <button class="secondary" data-copy="${id}">Als eigenes Rezept kopieren</button>
      ${isBase?'':'<button class="secondary" data-edit="'+id+'">Bearbeiten</button><button class="danger" data-delete="'+id+'">Löschen</button>'}
    </details>`;
  }).join('');
}

let editingRecipe=null;
let editorReturnFocus=null;

function addIngredient(list,name='',amount='',unit='g'){
  const row=document.createElement('div');
  const extra=list.id==='editExtras';
  row.className=extra?'ingredient-row has-unit':'ingredient-row';
  row.innerHTML=`
    <label>${extra?'Zutat':'Mehlsorte'}<input data-name required></label>
    <label>${extra?'Menge':'Menge (g)'}<input data-amount required type="number" min="0" step="any" inputmode="decimal"></label>
    ${extra?'<label>Einheit<select data-unit><option value="g">g</option><option value="ml">ml</option></select></label>':''}
    <button type="button" class="editor-row-button" data-remove aria-label="${extra?'Zutat':'Mehlsorte'} entfernen">×</button>`;
  row.querySelector('[data-name]').value=name;
  row.querySelector('[data-amount]').value=amount;
  if(extra)row.querySelector('[data-unit]').value=unit;
  list.append(row);
  return row.querySelector('[data-name]');
}

function fitStep(textarea){
  textarea.style.height='auto';
  textarea.style.height=textarea.scrollHeight+2+'px';
}

function updateStepControls(){
  const steps=Array.from($('editSteps').children);
  steps.forEach((step,index)=>{
    step.querySelector('textarea').setAttribute('aria-label',`Schritt ${index+1}`);
    step.querySelector('[data-up]').disabled=index===0;
    step.querySelector('[data-down]').disabled=index===steps.length-1;
  });
}

function addStep(text=''){
  const step=document.createElement('li');
  step.innerHTML=`<textarea rows="2" required></textarea>
    <button type="button" class="editor-row-button" data-up aria-label="Schritt nach oben">↑</button>
    <button type="button" class="editor-row-button" data-down aria-label="Schritt nach unten">↓</button>
    <button type="button" class="editor-row-button" data-remove aria-label="Schritt entfernen">×</button>`;
  const textarea=step.querySelector('textarea');
  textarea.value=text;
  $('editSteps').append(step);
  return textarea;
}

function readIngredients(id){
  return Array.from($(id).children,row=>({
    name:row.querySelector('[data-name]').value.trim(),
    amount:row.querySelector('[data-amount]').valueAsNumber,
    unit:row.querySelector('[data-unit]')?.value??'g'
  }));
}
const totalFlour=rows=>rows.reduce((sum,row)=>sum+(row.amount||0),0);

function updateEditorTotals(){
  const flour=totalFlour(readIngredients('editFlours'));
  const water=$('editWater').valueAsNumber;
  const salt=$('editSalt').valueAsNumber;
  const difference=(editingRecipe?.flourGrams??flour)-flour;
  const hydration=flour&&Number.isFinite(water)?formatAmount(water/flour*100)+' %':'–';
  const saltPercent=flour&&Number.isFinite(salt)?formatAmount(salt/flour*100)+' %':'–';
  $('editorTotals').textContent=`${formatAmount(flour)} g Gesamtmehl · Hydration ${hydration} · Salz ${saltPercent}`;
  if(Math.abs(difference)>1e-7){
    $('editorTotals').textContent+=difference>0
      ? ` · Noch ${formatAmount(difference)} g Mehl hinzufügen.`
      : ` · ${formatAmount(-difference)} g Mehl zu viel.`;
  }
}

function openEditor(id,copy=false){
  const recipe=recipes.find(item=>item.id===id);
  if(id&&(!recipe||(!copy&&baseIds.has(id))))return;
  editingRecipe=copy?null:recipe;
  editorReturnFocus=document.activeElement;
  $('editorTitle').textContent=copy?'Rezept kopieren':recipe?'Rezept bearbeiten':'Neues Rezept';
  $('editName').value=copy?recipe.name.slice(0,110)+' (Kopie)':recipe?.name??'';
  $('fixedFlour').textContent=editingRecipe?`Feste Gesamtmehlmenge: ${formatAmount(recipe.flourGrams)} g`:'Die Summe der Mehlmengen wird beim Speichern festgelegt.';
  $('editFlours').replaceChildren();
  $('editExtras').replaceChildren();
  $('editSteps').replaceChildren();
  const flour=recipe?.flourGrams??defaultFlourGrams;
  const flours=recipe?.flours??[{name:'Weizenmehl Type 550',pct:100}];
  const flourPercent=flours.reduce((sum,item)=>sum+Number(item.pct),0);
  for(const item of flours)addIngredient($('editFlours'),item.name,amountFromPercent(flour,item.pct*100/flourPercent));
  for(const item of recipe?.extras??[])addIngredient($('editExtras'),item.name,amountFromPercent(flour,item.pct),item.unit);
  for(const step of recipe?.steps??[])addStep(step);
  $('editWater').value=amountFromPercent(flour,recipe?.water??70);
  $('editSalt').value=amountFromPercent(flour,recipe?.salt??2);
  $('editBake').value=recipe?.bake??'';
  $('editWarmMinutes').value=recipe?.warmMinutes??0;
  $('editWarmMinutes').closest('details').open=Number($('editWarmMinutes').value)>0;
  $('editorStatus').textContent='';
  updateEditorTotals();
  updateStepControls();
  $('editor').showModal();
  $('editor').querySelector('.editor-content').scrollTop=0;
  $('editSteps').querySelectorAll('textarea').forEach(fitStep);
}

function saveEditor(event){
  event.preventDefault();
  try{
    const flours=readIngredients('editFlours');
    const extras=readIngredients('editExtras');
    const total=totalFlour(flours);
    if(total<100||total>10000)throw Error('Die Gesamtmehlmenge muss zwischen 100 und 10.000 g liegen.');
    const flourGrams=editingRecipe?.flourGrams??Math.round(total);
    if(Math.abs(total-flourGrams)>1e-7)throw Error(editingRecipe
      ? `Die Mehlmischung muss zusammen ${formatAmount(flourGrams)} g ergeben.`
      : 'Die Gesamtmehlmenge muss eine ganze Grammzahl ergeben.');
    if([...flours,...extras].some(row=>!row.name))throw Error('Bitte benenne jede Zutat.');
    const toPercent=({name,amount,unit})=>({name,pct:amount/flourGrams*100,unit});
    const recipe=validate({
      ...editingRecipe,
      flourGrams,
      name:$('editName').value,
      flours:flours.map(toPercent),
      water:$('editWater').valueAsNumber/flourGrams*100,
      salt:$('editSalt').valueAsNumber/flourGrams*100,
      extras:extras.map(toPercent),
      steps:Array.from($('editSteps').querySelectorAll('textarea'),field=>field.value.trim()).filter(Boolean),
      bake:$('editBake').value,
      warmMinutes:$('editWarmMinutes').value
    });
    const nextRecipes=editingRecipe?recipes.map(item=>item.id===recipe.id?recipe:item):[...recipes,recipe];
    save(nextRecipes);
    recipes=nextRecipes;
    $('editor').close();
    updateSelect();
    renderList(recipe.id);
    const summary=$('recipeList').querySelector('details[open] summary');
    summary.focus();
    summary.scrollIntoView({block:'nearest'});
  }catch(error){
    $('editorStatus').textContent=error.message;
  }
}

$('recipeForm').addEventListener('submit',saveEditor);
$('recipeForm').addEventListener('input',event=>{
  $('editorStatus').textContent='';
  if(event.target.closest('#editSteps'))fitStep(event.target);
  if(event.target.matches('#editWater,#editSalt,#editFlours input'))updateEditorTotals();
});
$('recipeForm').addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button)return;
  const step=button.closest('#editSteps li');
  if(step){
    if(button.hasAttribute('data-remove')){
      const next=step.nextElementSibling??step.previousElementSibling;
      step.remove();
      (next?.querySelector('textarea')??$('addStep')).focus();
    }
    if(button.hasAttribute('data-up'))step.previousElementSibling?.before(step);
    if(button.hasAttribute('data-down'))step.nextElementSibling?.after(step);
    updateStepControls();
    if(step.isConnected)step.querySelector('textarea').focus();
  }else if(button.hasAttribute('data-remove')){
    const row=button.closest('.ingredient-row');
    const list=row.parentElement;
    row.remove();
    (list.querySelector('[data-name]')??(list.id==='editFlours'?$('addFlour'):$('addExtra'))).focus();
    updateEditorTotals();
  }
});
$('addFlour').onclick=()=>addIngredient($('editFlours')).focus();
$('addExtra').onclick=()=>addIngredient($('editExtras')).focus();
$('addStep').onclick=()=>{
  const step=addStep();
  updateStepControls();
  fitStep(step);
  step.focus();
};
$('newRecipe').onclick=()=>openEditor();
$('cancelEdit').onclick=()=>$('editor').close();
$('editor').addEventListener('close',()=>{
  if(editorReturnFocus?.isConnected)editorReturnFocus.focus();
});
$('recipeList').onclick=event=>{
  const button=event.target.closest('button');
  if(!button)return;
  const {use,copy,edit,delete:remove}=button.dataset;
  if(use){
    $('recipeSelect').value=use;
    recipeSelectionChanged();
    document.querySelector('nav button[data-tab="calculator"]').click();
  }else if(copy)openEditor(copy,true);
  else if(edit)openEditor(edit);
  else if(remove&&!baseIds.has(remove)&&confirm('Rezept wirklich löschen?')){
    recipes=recipes.filter(recipe=>recipe.id!==remove);
    normalizeLibrary();
    save();
    updateSelect();
  }
};
function download(name,data){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
function syncPlannerSelect(){const el=$('planRecipe');const old=el.value;el.innerHTML=recipes.map(r=>`<option value="${escapeHTML(r.id)}">${escapeHTML(r.name)}</option>`).join('');el.value=recipes.some(r=>r.id===old)?old:($('recipeSelect').value||'ciabatta')}
const planFields=['planRecipe','planTemperature','planRest','planBake','planPrep','planProof','planWarm','planStartWarm','planPreheat','finishAt'];
const samePlan=()=>current().id===$('planRecipe').value&&$('temperature').value===$('planTemperature').value;

function planWarmDefault(){
  if($('planTemperature').value!=='cold')return 0;
  return num(recipes.find(r=>r.id===$('planRecipe').value)?.warmMinutes,0,360);
}
function updatePlanFields(){
  $('planWarmField').classList.toggle('hidden',!planWarmDefault());
  $('planStartWarmField').classList.toggle('hidden',$('planTemperature').value!=='cold');
}
function planDefaults(useCalculatorHours=false){
  applyPlanDefaults(useCalculatorHours);
  calculate();
  plannerChanged();
}
function applyPlanDefaults(useCalculatorHours=false){
  const t=recipeTiming($('planRecipe').value);
  const profile=t[$('planTemperature').value];
  $('planRest').value=useCalculatorHours&&samePlan()?$('hours').value:profile.hours;
  $('planBake').value=t.bake;
  $('planPrep').value=t.prep;
  $('planProof').value=profile.proof;
  $('planWarm').value=planWarmDefault();
  $('planStartWarm').value=profile.start;
  $('planPreheat').value=t.preheat;
  updatePlanFields();
  if(samePlan())$('hours').value=$('planRest').value;
}
function savePlannerSettings(){
  const settings=Object.fromEntries(planFields.map(id=>[id,$(id).value]));
  settings.recipeSelect=current().id;
  settings.hours=num($('hours').value,2,72);
  localStorage.setItem(backupKey,JSON.stringify(settings));
}
function plannerChanged(){
  $('planResult').classList.add('hidden');
  $('planStatus').textContent='';
  savePlannerSettings();
}
function syncStockGare(source,target){
  const field=$(source);
  if(field.value===''||!Number.isFinite(field.valueAsNumber))return;
  field.value=num(field.value,2,72);
  if(samePlan())$(target).value=field.value;
}
function dateLocal(d){return d.toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short'})}
function plan(){const end=new Date($('finishAt').value);if(isNaN(end.getTime())){plannerChanged();$('planStatus').textContent='Bitte eine gültige Fertigstellungszeit eingeben.';$('finishAt').focus();return}$('planStatus').textContent='';const cold=$('planTemperature').value==='cold';const bake=num($('planBake').value,5,180),proof=num($('planProof').value,0,360),rest=num($('planRest').value,2,72)*60,prep=num($('planPrep').value,0,180),warm=planWarmDefault()?num($('planWarm').value,0,360):0,startWarm=cold?num($('planStartWarm').value,0,240):0,preheat=num($('planPreheat').value,0,120);let t=end.getTime();const rows=[['Brot fertig',new Date(t)]];t-=bake*60000;const bakeStart=t;rows.push(['Backen beginnen',new Date(t)]);rows.push(['Ofen vorheizen (parallel zur letzten Gare)',new Date(bakeStart-preheat*60000)]);t-=proof*60000;rows.push(['Formen / Stückgare beginnen',new Date(t)]);t-=warm*60000;if(warm)rows.push(['Teig aus Kühlschrank nehmen / warmwerden lassen',new Date(t)]);t-=rest*60000;rows.push([cold?'Kühlschrankgare beginnen':'Stockgare beginnen',new Date(t)]);t-=startWarm*60000;if(startWarm)rows.push(['Teig bei Raumtemperatur anspringen lassen',new Date(t)]);t-=prep*60000;rows.push(['Zutaten vorbereiten',new Date(t)]);rows.sort((a,b)=>a[1]-b[1]);$('planResult').innerHTML='<h2>Dein Zeitplan</h2>'+rows.map(([s,d])=>`<div class="row"><span>${escapeHTML(s)}</span><strong>${dateLocal(d)}</strong></div>`).join('')+'<p class="muted">Ofenvorheizen läuft parallel zur letzten Gare. Zeitangaben sind Richtwerte – Volumen und Teigzustand entscheiden.</p>';$('planResult').classList.remove('hidden');savePlannerSettings()}

for(const b of document.querySelectorAll('nav button'))b.addEventListener('click',()=>{document.querySelectorAll('section').forEach(s=>s.classList.toggle('active',s.id===b.dataset.tab));document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x===b));window.scrollTo(0,0)});
$('yeastType').addEventListener('input',calculate);
$('recipeSelect').addEventListener('change',recipeSelectionChanged);
function changeTemperature(mode){
  $('temperature').value=mode;
  $('planTemperature').value=mode;
  resetHours();
  planDefaults();
}
$('temperature').addEventListener('change',()=>changeTemperature($('temperature').value));
$('planTemperature').addEventListener('change',()=>changeTemperature($('planTemperature').value));
for(const [source,target] of [['hours','planRest'],['planRest','hours']]){
  const field=$(source);
  field.addEventListener('input',()=>{
    if(field.value===''||field.validity.rangeUnderflow||field.validity.rangeOverflow)return;
    if(samePlan())$(target).value=field.value;
    calculate();
    plannerChanged();
  });
  field.addEventListener('change',()=>{
    if(field.value===''){
      field.value=source==='hours'
        ? fermentation(current().id,$('temperature').value).hours
        : fermentation($('planRecipe').value,$('planTemperature').value).hours;
    }
    syncStockGare(source,target);
    calculate();
    plannerChanged();
  });
}
$('copyRecipe').onclick=async()=>{
  const status=$('copyStatus');
  status.textContent='';
  try{
    await navigator.clipboard.writeText(window.lastRecipeText);
    status.textContent='Rezept kopiert.';
  }catch{
    status.textContent='Kopieren nicht möglich.';
  }
};
$('planButton').onclick=plan;$('planRecipe').onchange=() => planDefaults(true);$('planDefaults').onclick=() => planDefaults();for(const id of ['planBake','planPrep','planProof','planWarm','planStartWarm','planPreheat','finishAt'])$(id).addEventListener('input',plannerChanged);$('exportButton').onclick=()=>download('brotzeit-rezepte.json',{version:2,recipes:recipes.filter(r=>!baseIds.has(r.id))});
function fullBackup(){let settings={};try{settings=JSON.parse(localStorage.getItem(backupKey)||'{}')}catch{}return{format:'brotzeit-backup',version:2,createdAt:new Date().toISOString(),recipes:clone(recipes.filter(r=>!baseIds.has(r.id))),settings}}
$('backupButton').onclick=()=>{download('brotzeit-backup-'+new Date().toISOString().slice(0,10)+'.json',fullBackup());$('backupStatus').textContent='Backup heruntergeladen. Speichere die Datei in iCloud Drive oder einem anderen sicheren Ort.'};
$('restoreFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>2*1024*1024)throw Error('Datei zu groß');const obj=JSON.parse(await file.text());if(obj.format!=='brotzeit-backup'||obj.version!==2||!Array.isArray(obj.recipes)||obj.recipes.length>500)throw Error('Keine gültige Brotzeit-Sicherungsdatei');const incoming=obj.recipes.map(validate);if(!obj.settings||typeof obj.settings!=='object'||Array.isArray(obj.settings))throw Error('Ungültige Einstellungen');if(!confirm('Die aktuellen eigenen Rezepte und Planer-Einstellungen werden ersetzt. Fortfahren?'))return;download('brotzeit-sicherung-vor-wiederherstellung.json',fullBackup());const ids=new Set(baseIds);for(const r of incoming){if(ids.has(r.id))r.id=crypto.randomUUID();ids.add(r.id)}recipes=[...clone(defaults),...incoming];save();updateSelect();localStorage.setItem(backupKey,JSON.stringify(obj.settings));restorePlannerSettings();$('backupStatus').textContent=`Backup wiederhergestellt: ${incoming.length} eigene Rezepte.`}catch(err){$('backupStatus').textContent='Wiederherstellung fehlgeschlagen: '+err.message}finally{e.target.value=''}};
function restorePlannerSettings(){
  let settings;
  try{settings=JSON.parse(localStorage.getItem(backupKey)||'null')}catch{}
  const hasRecipe=id=>recipes.some(recipe=>recipe.id===id);
  const planRecipe=hasRecipe(settings?.planRecipe)?settings.planRecipe:current().id;
  const calculatorRecipe=hasRecipe(settings?.recipeSelect)?settings.recipeSelect:planRecipe;
  const mode=settings?.planTemperature==='room'?'room':'cold';
  $('planRecipe').value=planRecipe;
  $('recipeSelect').value=calculatorRecipe;
  $('planTemperature').value=mode;
  $('temperature').value=mode;
  resetHours();
  applyPlanDefaults();
  for(const id of planFields.slice(2)){
    if(settings?.[id]!=null&&settings[id]!=='')$(id).value=String(settings[id]);
  }
  $('planRest').value=num($('planRest').value||fermentation(planRecipe,mode).hours,2,72);
  $('planWarm').value=planWarmDefault()?num($('planWarm').value,0,360):0;
  if(mode!=='cold')$('planStartWarm').value=0;
  if(samePlan())$('hours').value=$('planRest').value;
  else if(settings?.hours!=null)$('hours').value=num(settings.hours,2,72);
  calculate();
  plannerChanged();
}
$('exampleButton').onclick=()=>download('brotzeit-beispiel.json',{version:1,recipes:[defaults[1]]});
$('importFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>1024*1024)throw Error('Datei zu groß (max. 1 MB)');const parsed=JSON.parse(await file.text());const incoming=Array.isArray(parsed)?parsed:parsed.recipes;if(!Array.isArray(incoming)||!incoming.length||incoming.length>100)throw Error('Erwartet wird eine Liste mit 1–100 Rezepten');const valid=incoming.map(validate);for(const r of valid){const index=recipes.findIndex(x=>x.id===r.id);if(index>=0||baseIds.has(r.id)){r.id=crypto.randomUUID()}recipes.push(r)}save();updateSelect();$('importStatus').textContent=`${valid.length} Rezept(e) importiert.`}catch(err){$('importStatus').textContent='Import fehlgeschlagen: '+err.message}e.target.value=''};
$('resetButton').onclick=()=>{if(confirm('Eigene Rezepte und Einstellungen löschen? Bitte vorher ein Backup erstellen.')){recipes=clone(defaults);localStorage.removeItem(backupKey);save();updateSelect();recipeSelectionChanged()}};
const soon=new Date(Date.now()+24*3600000);soon.setMinutes(0,0,0);const pad=n=>String(n).padStart(2,'0');$('finishAt').value=`${soon.getFullYear()}-${pad(soon.getMonth()+1)}-${pad(soon.getDate())}T${pad(soon.getHours())}:${pad(soon.getMinutes())}`;
updateSelect();restorePlannerSettings();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});

const screenToggle=$('keepScreenOn');
const screenStatus=$('screenStatus');
let screenLock=null;
let screenLockPending=false;

async function syncScreenLock(){
  if(!screenToggle.checked || document.visibilityState!=='visible'){
    const lock=screenLock;
    screenLock=null;
    if(!screenToggle.checked)screenStatus.textContent='';
    if(lock && !lock.released)await lock.release();
    return;
  }
  if(screenLockPending || (screenLock && !screenLock.released))return;

  screenLockPending=true;
  try{
    const lock=await navigator.wakeLock.request('screen');
    if(!screenToggle.checked || document.visibilityState!=='visible'){
      await lock.release();
      return;
    }
    if(lock.released){
      screenStatus.textContent='Das Gerät hat die Displaysperre wieder aktiviert.';
      return;
    }
    screenLock=lock;
    screenStatus.textContent='Das Display bleibt an, solange Brotzeit sichtbar ist.';
    lock.addEventListener('release',()=>{
      if(screenLock!==lock)return;
      screenLock=null;
      if(screenToggle.checked && document.visibilityState==='visible'){
        screenStatus.textContent='Das Gerät hat die Displaysperre wieder aktiviert.';
      }
    },{once:true});
  }catch{
    if(screenToggle.checked && document.visibilityState==='visible'){
      screenToggle.checked=false;
      screenStatus.textContent='Das Display konnte nicht eingeschaltet gehalten werden.';
    }
  }finally{
    screenLockPending=false;
  }
}

screenToggle.checked=false;
if(typeof navigator.wakeLock?.request==='function'){
  screenToggle.addEventListener('change',syncScreenLock);
  document.addEventListener('visibilitychange',syncScreenLock);
}else{
  screenToggle.disabled=true;
  screenStatus.textContent='Diese Option ist in diesem Browser nicht verfügbar.';
}
