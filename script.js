const KEY='sprout-savings-v1';
const state=loadState();let entryType='in',toastTimer;
const $=id=>document.getElementById(id);
function loadState(){try{return JSON.parse(localStorage.getItem(KEY))||{goal:null,entries:[]}}catch{return{goal:null,entries:[]}}}
function saveState(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function money(value){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(value)}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function showToast(message){const toast=$('toast');toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2800)}
function formatDate(date){return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(new Date(date))}
function totals(){return state.entries.reduce((sum,e)=>sum+(e.type==='in'?e.amount:-e.amount),0)}
function render(){
  const saved=Math.max(0,totals()),goal=state.goal,target=goal?.target||0,percent=target?Math.min(100,Math.round(saved/target*100)):0;
  $('savedAmount').textContent=money(saved);$('targetAmount').textContent=money(target);$('goalProgress').style.width=`${percent}%`;$('goalPercent').textContent=goal?`${percent}% grown`:'0% grown';$('goalTitle').textContent=goal?.name||'No goal yet';$('deadlineText').textContent=goal?.date?`By ${formatDate(goal.date)}`:'Choose a goal to begin';
  const stage=percent>=100?4:percent>=70?3:percent>=35?2:1;$('treeArt').className=`tree-art stage-${stage}`;$('levelPill').textContent=`LEVEL ${stage}`;
  const messages=percent>=100?['Dream achieved!','You grew all the way to your goal!']:stage===3?['Wow, what a tree!','You’re almost there. Keep believing!']:stage===2?['Your tree is getting bushy!','Keep going — your dream is getting closer.']:stage===1&&percent>0?['Look at those leaves!','You’re off to a lovely start.']:['Your first leaves are on the way!','Save a little to help your tree grow.'];$('treeMessage').textContent=messages[0];$('treeSubmessage').textContent=messages[1];
  $('entryCount').textContent=`${state.entries.length} ${state.entries.length===1?'entry':'entries'}`;$('historyList').innerHTML=state.entries.length?state.entries.map((e,i)=>`<div class="history-row" style="animation-delay:${i*35}ms"><span class="entry-icon ${e.type}">${e.type==='in'?'＋':'−'}</span><div><span class="entry-name">${escapeHtml(e.name)}</span><span class="entry-date">${formatDate(e.date)}</span></div><strong class="entry-amount ${e.type}">${e.type==='in'?'+':'−'}${money(e.amount)}</strong></div>`).join(''):`<div class="empty-state"><span>🪙</span><strong>Your story starts here</strong><p>Log money in or out to see it appear here.</p></div>`;
  $('editGoalButton').disabled=!goal;$('editGoalButton').style.opacity=goal?'1':'.4';saveState();
}
function openDialog(id){$(id).showModal()}function closeDialog(id){$(id).close()}
$('goalButton').addEventListener('click',()=>{if(state.goal){$('goalName').value=state.goal.name;$('goalTarget').value=state.goal.target;$('goalDate').value=state.goal.date||''}else $('goalForm').reset();openDialog('goalDialog')});
$('editGoalButton').addEventListener('click',()=>{if(state.goal){$('goalName').value=state.goal.name;$('goalTarget').value=state.goal.target;$('goalDate').value=state.goal.date||'';openDialog('goalDialog')}});
$('goalForm').addEventListener('submit',e=>{e.preventDefault();state.goal={name:$('goalName').value.trim(),target:Number($('goalTarget').value),date:$('goalDate').value};closeDialog('goalDialog');render();showToast('Your new dream is planted! 🌱')});
function openMoney(type){entryType=type;$('moneyForm').reset();$('moneyEyebrow').textContent=type==='in'?'MONEY IN':'MONEY OUT';$('moneyEyebrow').className=`eyebrow ${type==='in'?'green-text':'coral-text'}`;$('moneyTitle').textContent=type==='in'?'Add to your savings':'Log a spend';$('entrySubmit').innerHTML=type==='in'?'Add money <span>✦</span>':'Log it <span>🌼</span>';$('entryName').placeholder=type==='in'?'e.g. Birthday money':'e.g. Ice cream';openDialog('moneyDialog')}
$('moneyInButton').addEventListener('click',()=>openMoney('in'));$('moneyOutButton').addEventListener('click',()=>openMoney('out'));
$('moneyForm').addEventListener('submit',e=>{e.preventDefault();state.entries.unshift({id:Date.now(),type:entryType,name:$('entryName').value.trim(),amount:Number($('entryAmount').value),date:new Date().toISOString()});closeDialog('moneyDialog');render();showToast(entryType==='in'?'Yay! Your tree grew a little 🌿':'Logged! Every choice is part of the journey.')});
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>closeDialog(button.dataset.close)));document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()}));render();
