import { icon } from './icons.js';
import { workspaceKey } from './workspace-storage.js';
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(text,action,cls='',attrs='')=>`<button type="button" data-collab="${action}" class="${cls}" ${attrs}>${text}</button>`;
let isStudent=false;
let key='',db,profile,tab='Groups',scope='all',query='',dialog='',selected='',notice='',controller;
export function collabSeed(student) {
  const people=[{id:'p1',name:'Alex Morgan',focus:student?'Biology · second year':'Product design'},{id:'p2',name:'Jordan Lee',focus:student?'Chemistry · second year':'Research and analysis'},{id:'p3',name:'Sam Patel',focus:student?'Biology · third year':'Engineering'},{id:'p4',name:'Riley Kim',focus:student?'Mathematics · second year':'Independent researcher'}];
  const groups=student?[
    {id:'g1',name:'NYU students',type:'School',description:'A student-run place to meet people and find groups across campus',school:'New York University',people:['p1','p2','p3','p4'],joined:false},
    {id:'g2',name:'Cell Biology · BIO 201',type:'Course',description:'Compare concepts, ask questions, and find a study partner',school:'New York University',term:'Fall 2026',people:['p1','p3'],joined:true},
    {id:'g3',name:'General Chemistry · CHEM 101',type:'Course',description:'Work through practice problems and prepare for exams together',school:'New York University',term:'Fall 2026',people:['p2','p3'],joined:true},
    {id:'g4',name:'Calculus study circle',type:'Study',description:'A small group for weekly problem-solving sessions',school:'New York University',people:['p4'],joined:false}
  ]:[
    {id:'g1',name:'Product research circle',type:'Research',description:'Compare research methods and discuss what you are learning',people:['p1','p2','p4'],joined:true},
    {id:'g2',name:'Independent builders',type:'Project',description:'Find collaborators and work through project ideas together',people:['p1','p3'],joined:true},
    {id:'g3',name:'Weekly reading group',type:'Study',description:'Discuss one paper or article each week',people:['p2','p4'],joined:false}
  ];
  return {people,groups,schoolEmail:'',invites:[]};
}
export const isNyuEmail = email => /^[^\s@]+@nyu\.edu$/i.test(String(email).trim());
export function requestSchoolCode(state, email, now = Date.now()) {
  if (!isNyuEmail(email)) return false;
  state.schoolVerification={email:email.trim().toLowerCase(),status:'pending',requestedAt:now};
  return true;
}
export function confirmSchoolCode(state, code, now = Date.now()) {
  const v=state.schoolVerification;
  if (!v || v.status!=='pending' || now-v.requestedAt>600000 || String(code).trim()!=='123456') return false;
  v.status='verified';state.schoolEmail=v.email;return true;
}
const schoolVerified = () => db.schoolVerification?.status==='verified' && isNyuEmail(db.schoolVerification.email);
function schoolSection() {
  const verification=db.schoolVerification;
  if(schoolVerified())return `<section class="collab-school-community"><div class="collab-school-heading"><span class="collab-school-mark">NYU</span><div><h2>New York University</h2><p class="muted">Student-run community</p></div><span class="badge">Email confirmed · demo</span></div><p class="collab-school-address">${esc(verification.email)} ${button('Change email','school-reset','')}</p><h3>School and course groups</h3><div class="collab-group-list">${db.groups.filter(g=>g.school==='New York University').map(g=>button(`<span class="row-copy"><span>${esc(g.name)}</span><small>${esc(g.description)}</small></span><span class="badge">${g.joined?'Joined':esc(g.type)}</span>${icon('right',14)}`,'group','collab-group',`data-id="${g.id}"`)).join('')||'<p class="muted">Create a group to start your community</p>'}</div>${button('Find people at NYU','school-people','subtle')}</section>`;
  return `<section class="collab-school-verification"><span class="collab-school-mark">${verification?.status==='pending'?'NYU':icon('globe',24)}</span><h2>${verification?.status==='pending'?'Verify your school email':'Find your university'}</h2>${verification?.status==='pending'?'<p class="collab-school-match">New York University</p>':''}<p class="muted">Verify your school email to meet classmates and join student-run groups</p>${verification?.status==='pending'?`<form id="collab-school-code"><label>Verification code<input name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" required placeholder="6-digit code"></label><p class="muted collab-note">For ${esc(verification.email)}</p><p class="collab-note">Prototype code: <strong>123456</strong></p><div class="collab-verification-actions">${button('Change email','school-reset','subtle')}<button class="primary" type="submit">Verify email ${icon('right',14)}</button></div></form>`:`<form id="collab-school-email"><label>School email<input name="email" type="email" required placeholder="you@university.edu" autocomplete="email"></label><p class="muted collab-note">We’ll find your university from your email address</p><button class="primary" type="submit">Continue ${icon('right',14)}</button></form>`}</section>`;
}
const save=()=>localStorage.setItem(key,JSON.stringify(db));
const initials=name=>name.split(/\s+/).slice(0,2).map(n=>n[0]).join('');
const joinedGroups=()=>db.groups.filter(g=>g.joined);
const personGroups=id=>db.groups.filter(g=>g.people.includes(id));
function close(){dialog='';selected='';}
function modal() {
  if(!dialog)return '';
  let title='',body='';
  if(dialog==='create') {
    title='Create a group';body=`<form id="collab-create"><label>Group name<input name="name" maxlength="80" required placeholder="e.g. Thursday chemistry review"></label><div class="form-columns"><label>Group type<select name="type">${['Study','Course','School','Project','Research'].map(t=>`<option>${t}</option>`).join('')}</select></label><label>School or organization <span class="muted">Optional</span><input name="school" maxlength="100"></label></div><label>Description<textarea name="description" maxlength="400" rows="3" placeholder="What brings this group together?"></textarea></label><div class="dialog-footer">${button('Cancel','close','subtle')}<button type="submit" class="primary">Create group</button></div></form>`;
  } else if(dialog==='invite') {
    title='Invite someone';body=`<form id="collab-invite"><label>Email address<input type="email" name="email" required placeholder="name@example.com"></label><label>Group<select name="group">${joinedGroups().map(g=>`<option value="${g.id}">${esc(g.name)}</option>`).join('')}</select></label><div class="dialog-footer">${button('Cancel','close','subtle')}<button class="primary" type="submit" ${joinedGroups().length?'':'disabled'}>Add invitation</button></div></form>`;
  } else if(dialog==='person') {
    const p=db.people.find(p=>p.id===selected);if(!p)return '';
    title=p.name;body=`<div class="collab-profile"><span class="avatar large">${initials(p.name)}</span><p>${esc(p.focus)}</p></div><h3>Groups</h3><div class="collab-profile-groups">${personGroups(p.id).map(g=>button(esc(g.name)+icon('right',14),'group','',`data-id="${g.id}"`)).join('')}</div><div class="dialog-footer">${button('Done','close','primary')}</div>`;
  } else if(dialog==='school-required') {
    title='Verify your school email';body=`<p class="muted">Verify your school email before viewing members or joining school groups</p><div class="dialog-footer">${button('Go to School','school-start','primary')}</div>`;
  } else {
    const g=db.groups.find(g=>g.id===selected);if(!g)return '';
    title=g.name;
    body=`<div class="inline-meta"><span class="badge">${esc(g.type)}</span>${g.school&&['School','Course','Study'].includes(g.type)?'<span class="badge">Student-run</span>':''}${g.joined?'<span class="badge">Joined</span>':''}</div><p class="muted">${esc(g.description)}</p>${g.school?`<p class="collab-school">${esc(g.school)}${g.term?' · '+esc(g.term):''}</p>`:''}<h3 class="collab-members-title">People · ${g.people.length+(g.joined?1:0)}</h3><div class="collab-members">${g.joined?`<div><span class="avatar">${initials(profile)}</span><span>${esc(profile)}</span><small>You</small></div>`:''}${g.people.map(id=>{const p=db.people.find(p=>p.id===id);return `<div><span class="avatar">${initials(p.name)}</span><span>${esc(p.name)}</span>${button('View','person','',`data-id="${p.id}"`)}</div>`}).join('')}</div><div class="dialog-footer">${g.joined?button('Leave group','leave','subtle'):''}${button(g.joined?'Invite people':'Join group',g.joined?'invite':'join','primary')}</div>`;
  }
  return `<div class="modal-backdrop" data-collab="close"></div><section class="dialog collab-dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="dialog-heading"><h2>${esc(title)}</h2>${button(icon('close'),'close','icon-button','aria-label="Close Collab dialog"')}</div>${body}</section>`;
}
export function renderCollab(workspace) {
  isStudent=workspace.kind==='student';
  const next=workspaceKey('speqq-collab-v1');profile=workspace.profile.first+' '+workspace.profile.last;
  if(next!==key){key=next;try{db=JSON.parse(localStorage.getItem(key));}catch{}if(!db||!Array.isArray(db.groups)||!Array.isArray(db.people))db=collabSeed(workspace.kind==='student');tab='Groups';scope='all';query='';close();notice='';for(const g of db.groups){if(g.school==='Northbridge University')g.school='New York University';if(g.name==='Northbridge students')g.name='NYU students';}}
  const groups=db.groups.filter(g=>(scope!=='joined'||g.joined)&&[g.name,g.school,g.type,g.description].join(' ').toLowerCase().includes(query.toLowerCase()));
  const people=db.people.filter(p=>(!isStudent||schoolVerified()||personGroups(p.id).some(g=>!g.school))).filter(p=>[p.name,p.focus,...personGroups(p.id).map(g=>g.name)].join(' ').toLowerCase().includes(query.toLowerCase()));
  return `<div class="page collab-page"><div class="page-title"><h1>Collab</h1><span class="spacer"></span>${tab==='School'?'':button(icon('plus',15)+(tab==='Groups'?'Create group':'Invite people'),tab==='Groups'?'create':'invite','primary')}</div><div class="collab-tabs" role="tablist">${['Groups','People','School'].map(t=>button(t,'tab',t===tab?'selected':'',`role="tab" aria-selected="${t===tab}" data-tab="${t}"`)).join('')}</div><div class="toolbar" ${tab==='School'?'hidden':''}><label class="search">${icon('search',15)}<input id="collab-search" value="${esc(query)}" placeholder="Search ${tab.toLowerCase()}" aria-label="Search ${tab.toLowerCase()}"></label><span class="spacer"></span>${tab==='Groups'?`<select id="collab-scope" aria-label="Groups to show"><option value="all" ${scope==='all'?'selected':''}>All groups</option><option value="joined" ${scope==='joined'?'selected':''}>My groups</option></select>`:''}</div>${tab==='School'?schoolSection():tab==='Groups'?`<div class="collab-group-list">${groups.map(g=>`<button class="collab-group" data-collab="group" data-id="${g.id}"><span class="brand">${icon('Team',20)}</span><span class="row-copy"><span>${esc(g.name)}</span><small>${esc(g.description)}</small><small>${esc(g.school||g.type)}${g.term?' · '+esc(g.term):''}</small></span><span class="collab-group-meta"><span class="badge">${g.joined?'Joined':esc(g.type)}</span><small>${g.people.length+(g.joined?1:0)} ${g.people.length+(g.joined?1:0)===1?'person':'people'}</small></span>${icon('right',14)}</button>`).join('')||'<div class="empty"><h3>No groups found</h3><p>Create a group or try another search</p></div>'}</div>`:`<div class="collab-people">${people.map(p=>{const shared=personGroups(p.id).filter(g=>g.joined);return `<button class="collab-person" data-collab="person" data-id="${p.id}"><span class="avatar medium">${initials(p.name)}</span><span class="row-copy"><span>${esc(p.name)}</span><small>${esc(p.focus)}</small></span><small class="muted">${shared.length?shared.length+' shared '+(shared.length===1?'group':'groups'):'Discover through groups'}</small>${icon('right',14)}</button>`}).join('')||(isStudent&&!schoolVerified()?`<div class="empty"><h3>Find people at your school</h3><p>Verify your school email to discover classmates</p>${button('Verify school email','school-start','subtle')}</div>`:'<div class="empty">No people found</div>')}</div>${db.invites.length?`<section class="collab-invites"><h3>Invitations</h3>${db.invites.map(i=>`<div><span>${esc(i.email)}</span><small>${esc(db.groups.find(g=>g.id===i.group)?.name||'Group')}</small><span class="badge">Invited</span></div>`).join('')}</section>`:''}`}<div role="status" class="collab-status">${esc(notice)}</div>${modal()}</div>`;
}
export function bindCollab(root,redraw,active) {
  controller?.abort();if(!active)return;controller=new AbortController();const opts={signal:controller.signal};
  root.addEventListener('click',e=>{const el=e.target.closest('[data-collab]');if(!el)return;const action=el.dataset.collab;
    if(action==='tab'){tab=el.dataset.tab;query='';}
    else if(action==='school-start'){tab='School';close();notice='';}
    else if(action==='school-people')tab='People';
    else if(action==='school-reset'){db.schoolVerification=null;db.schoolEmail='';save();notice='';}
    else if(action==='close')close();
    else if(action==='create'||action==='invite')dialog=action;
    else if(action==='group'||action==='person'){selected=el.dataset.id;dialog=action;if(action==='group'&&db.groups.find(g=>g.id===selected)?.school&&!schoolVerified())dialog='school-required';}
    else if(action==='join'||action==='leave'){const g=db.groups.find(g=>g.id===selected);if(action==='join'&&g.school&&!schoolVerified()){tab='School';close();redraw();return;}g.joined=action==='join';save();notice=action==='join'?'You joined '+g.name:'You left '+g.name;close();}
    redraw();
  },opts);
  root.addEventListener('input',e=>{if(e.target.id!=='collab-search')return;query=e.target.value;const pos=e.target.selectionStart;redraw();const input=root.querySelector('#collab-search');input.focus();input.setSelectionRange(pos,pos);},opts);
  root.addEventListener('change',e=>{if(e.target.id==='collab-scope'){scope=e.target.value;redraw();}},opts);
  root.addEventListener('submit',e=>{
    if(!e.target.id.startsWith('collab-'))return;e.preventDefault();const form=new FormData(e.target);
    if(e.target.id==='collab-school-email'){if(!requestSchoolCode(db,String(form.get('email')))){notice='We couldn’t match that email to a university — check your school address';}else{save();notice='';}redraw();return;}
    if(e.target.id==='collab-school-code'){if(confirmSchoolCode(db,String(form.get('code')))){save();notice='School email confirmed for this demo';}else{notice='Check the code or restart verification if it has expired';}redraw();return;}
    if(e.target.id==='collab-create'){const name=String(form.get('name')).trim();if(!name)return;db.groups.push({id:crypto.randomUUID(),name,type:form.get('type'),school:String(form.get('school')).trim(),description:String(form.get('description')).trim(),people:[],joined:true});notice='Group created';}
    if(e.target.id==='collab-invite'){const email=String(form.get('email')).trim(),group=String(form.get('group'));if(!db.groups.some(g=>g.id===group&&g.joined))return;if(!db.invites.some(i=>i.email.toLowerCase()===email.toLowerCase()&&i.group===group))db.invites.push({email,group});notice='Invitation added';}
    save();close();redraw();
  },opts);
  root.addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog){close();redraw();}},opts);
}
