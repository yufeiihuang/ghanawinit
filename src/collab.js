import { icon } from './icons.js';
import { workspaceKey } from './workspace-storage.js';
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(text,action,cls='',attrs='')=>`<button type="button" data-collab="${action}" class="${cls}" ${attrs}>${text}</button>`;
let isStudent=false;
let openSchoolSettings=false;
export function renderSchoolProfile() {
 let school;try{school=JSON.parse(localStorage.getItem(workspaceKey('speqq-collab-v1')))?.schoolVerification;}catch{}
 return `<section class="panel profile-fields"><label><span>School email</span><span>${esc(school?.email||'Not added')}</span><button type="button" class="subtle" data-action="change-school-email">${school?.email?'Change school email':'Add school email'}</button></label></section>`;
}
export function changeSchoolEmail() {
 const storageKey=workspaceKey('speqq-collab-v1');let stored;try{stored=JSON.parse(localStorage.getItem(storageKey));}catch{}
 if(stored){stored.schoolVerification=null;stored.schoolEmail='';localStorage.setItem(storageKey,JSON.stringify(stored));}
 if(key===storageKey&&db){db.schoolVerification=null;db.schoolEmail='';}
 openSchoolSettings=true;
}
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
  const state={people,groups,schoolEmail:'',invites:[]};
  migrateCollab(state,student);
  return state;
}
export function migrateCollab(state,student) {
  for(const g of state.groups) if(!g.visibility)g.visibility='public';
  if(!Array.isArray(state.incomingInvites)) {
    const groupId='group-invited-demo';
    state.groups.push({id:groupId,name:student?'Midterm review group':'Research reading circle',type:student?'Study':'Research',description:student?'A small group to prepare for the next biology exam':'A private group for discussing research papers',school:student?'New York University':'',people:['p1','p2'],joined:false,visibility:'private'});
    state.incomingInvites=[{id:'invite-demo-1',groupId,inviterId:'p1',status:'pending'}];
  }
  return state;
}
export function collabSections(state) {
  const invitations=state.incomingInvites.filter(i=>i.status==='pending'&&state.groups.some(g=>g.id===i.groupId&&!g.joined));
  return {yours:state.groups.filter(g=>g.joined),invitations,discover:state.groups.filter(g=>!g.joined&&g.visibility==='public'&&!invitations.some(i=>i.groupId===g.id))};
}
function groupCard(g,reason) {
 return `<button class="collab-group" data-collab="group" data-id="${g.id}"><span class="brand">${icon('Team',20)}</span><span class="row-copy"><span>${esc(g.name)}</span><small>${esc(g.description)}</small>${reason?`<small>${esc(reason)}</small>`:''}</span><span class="collab-group-meta">${!g.joined?'<span class="badge">Public group</span>':''}<small>${g.people.length+(g.joined?1:0)} ${g.people.length+(g.joined?1:0)===1?'person':'people'}</small></span>${g.joined?icon('right',14):'<span class="collab-join-action">View group</span>'}</button>`;
}
function groupsContent(groups) {
 const sections=collabSections(db),match=g=>groups.includes(g);
 const yours=sections.yours.filter(match),invites=sections.invitations.filter(i=>groups.some(g=>g.id===i.groupId));
 const discover=sections.discover.filter(match).filter(g=>!g.school||schoolVerified());
 const section=(title,description,body)=>`<section class="collab-directory-section"><div class="collab-section-heading"><h2>${title}</h2><p>${description}</p></div>${body}</section>`;
 return section('Your groups','Groups you created or joined',`<div class="collab-group-list">${yours.map(g=>groupCard(g,g.created?'Created by you':g.school?g.school+(g.term?' · '+g.term:''):'')).join('')||'<p class="collab-section-empty">No groups here yet</p>'}</div>`)
 + (scope==='joined'?'':section('Invitations','People have invited you to these groups',`<div class="collab-group-list">${invites.map(i=>{const g=db.groups.find(g=>g.id===i.groupId),person=db.people.find(p=>p.id===i.inviterId);return `<article class="collab-invitation"><span class="avatar medium">${initials(person.name)}</span><div class="row-copy"><span>${esc(g.name)}</span><small>Invited by ${esc(person.name)} · Invite-only group</small></div><div class="collab-invite-actions">${button('Decline','decline-invite','subtle',`data-id="${i.id}"`)}${button('Accept invite','accept-invite','primary',`data-id="${i.id}"`)}</div></article>`}).join('')||'<p class="collab-section-empty">No pending invitations</p>'}</div>`)
 + section('Discover','Public groups you can choose to join',`<div class="collab-group-list">${discover.map(g=>groupCard(g,g.school?'From your institution · '+g.school:'Public community')).join('')||'<p class="collab-section-empty">No public groups to show</p>'}</div>${isStudent&&!schoolVerified()?`<div class="collab-school-discover"><span>Find public groups at your institution</span>${button('Verify school email','school-start','subtle')}</div>`:''}`));
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
  if(schoolVerified()) {
    const groups=db.groups.filter(g=>g.school==='New York University'&&(g.visibility==='public'||g.joined));
    return `<section class="collab-school-community"><div class="collab-institution-identity"><img class="collab-school-mark collab-nyu-logo" src="./src/assets/logos/nyu.png" alt="NYU"><div class="row-copy"><h2>New York University</h2><span class="collab-identity-email">${esc(verification.email)}</span></div></div><div class="collab-campus-toolbar"><h3>School and course groups</h3><span class="spacer"></span>${button('People at NYU','school-people','subtle')}${button(icon('plus',14)+' Create group','create','primary')}</div><div class="collab-group-list">${groups.map(g=>groupCard(g,g.joined?'':g.type)).join('')||`<div class="collab-campus-empty">${icon('Team',28)}<h3>Start a group at NYU</h3><p>Bring people together around a course, project, or shared interest</p>${button(icon('plus',14)+' Create group','create','subtle')}</div>`}</div></section>`;
  }
  if(verification?.status!=='pending')return `<section class="collab-institution"><div class="collab-institution-form"><span class="collab-eyebrow">YOUR COMMUNITY</span><h2>Find your institution</h2><p>Connect with people who share your campus</p><form id="collab-school-email"><label for="school-email">School email</label><input id="school-email" name="email" type="email" required placeholder="you@institution.edu" autocomplete="email"><button class="primary" type="submit">Find my institution ${icon('right',14)}</button></form></div><div class="collab-institution-preview"><h3>A familiar place to start</h3><div>${icon('Specs',20)}<span><strong>Course groups</strong><small>Find people taking the same classes</small></span></div><div>${icon('Team',20)}<span><strong>Study circles</strong><small>Join student-run groups around your interests</small></span></div><div>${icon('user',20)}<span><strong>People on your campus</strong><small>Meet classmates beyond your courses</small></span></div></div></section>`;
  return `<section class="collab-school-verification">${verification?.status==='pending'?'<img class="collab-school-mark collab-nyu-logo" src="./src/assets/logos/nyu.png" alt="NYU">':''}<h2>${verification?.status==='pending'?'Verify your school email':'Find your institution'}</h2>${verification?.status==='pending'?'<p class="collab-school-match">New York University</p>':''}<p class="muted">Meet classmates and join student-run groups</p>${verification?.status==='pending'?`<form id="collab-school-code"><label>Verification code<input name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" required placeholder="6-digit code"></label><p class="muted collab-note">For ${esc(verification.email)}</p><p class="collab-note">Prototype code: <strong>123456</strong></p><div class="collab-verification-actions">${button('Change email','school-reset','subtle')}<button class="primary" type="submit">Verify email ${icon('right',14)}</button></div></form>`:`<form id="collab-school-email"><label for="school-email">School email</label><div class="collab-email-row"><input id="school-email" name="email" type="email" required placeholder="you@institution.edu" autocomplete="email"><button class="primary" type="submit">Continue ${icon('right',14)}</button></div></form>`}</section>`;
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
    title='Create a group';body=`<form id="collab-create"><label>Group name<input name="name" maxlength="80" required placeholder="e.g. Thursday chemistry review"></label><div class="form-columns"><label>Group type<select name="type">${['Study','Course','School','Project','Research'].map(t=>`<option>${t}</option>`).join('')}</select></label><label>School or organization <span class="muted">Optional</span><input name="school" maxlength="100"></label></div><label>Visibility<select name="visibility"><option value="private">Invite only</option><option value="public">Public — discoverable by others</option></select></label><label>Description<textarea name="description" maxlength="400" rows="3" placeholder="What brings this group together?"></textarea></label><div class="dialog-footer">${button('Cancel','close','subtle')}<button type="submit" class="primary">Create group</button></div></form>`;
  } else if(dialog==='invite') {
    title='Invite someone';body=`<form id="collab-invite"><label>Email address<input type="email" name="email" required placeholder="name@example.com"></label><label>Group<select name="group">${joinedGroups().map(g=>`<option value="${g.id}">${esc(g.name)}</option>`).join('')}</select></label><div class="dialog-footer">${button('Cancel','close','subtle')}<button class="primary" type="submit" ${joinedGroups().length?'':'disabled'}>Add invitation</button></div></form>`;
  } else if(dialog==='person') {
    const p=db.people.find(p=>p.id===selected);if(!p)return '';
    title=p.name;body=`<div class="collab-profile"><span class="avatar large">${initials(p.name)}</span><p>${esc(p.focus)}</p></div><h3>Groups</h3><div class="collab-profile-groups">${personGroups(p.id).filter(g=>g.visibility==='public'||g.joined||db.incomingInvites.some(i=>i.groupId===g.id&&i.status==='pending')).map(g=>button(esc(g.name)+icon('right',14),'group','',`data-id="${g.id}"`)).join('')}</div><div class="dialog-footer">${button('Done','close','primary')}</div>`;
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
  if(next!==key){key=next;try{db=JSON.parse(localStorage.getItem(key));}catch{}if(!db||!Array.isArray(db.groups)||!Array.isArray(db.people))db=collabSeed(workspace.kind==='student');tab='Groups';scope='all';query='';close();notice='';for(const g of db.groups){if(g.school==='Northbridge University')g.school='New York University';if(g.name==='Northbridge students')g.name='NYU students';}migrateCollab(db,isStudent);}
  if(openSchoolSettings){tab='School';openSchoolSettings=false;notice='';}
  if(!isStudent&&tab==='School')tab='Groups';
  const groups=db.groups.filter(g=>(scope!=='joined'||g.joined)&&[g.name,g.school,g.type,g.description].join(' ').toLowerCase().includes(query.toLowerCase()));
  const people=db.people.filter(p=>(personGroups(p.id).some(g=>g.joined)||(schoolVerified()&&personGroups(p.id).some(g=>g.school==='New York University'&&g.visibility==='public')))).filter(p=>[p.name,p.focus,...personGroups(p.id).map(g=>g.name)].join(' ').toLowerCase().includes(query.toLowerCase()));
  return `<div class="page collab-page"><div class="page-title"><h1>Collab</h1><span class="spacer"></span>${tab==='School'?'':button(icon('plus',15)+(tab==='Groups'?'Create group':'Invite people'),tab==='Groups'?'create':'invite','primary')}</div><div class="collab-tabs" role="tablist">${(isStudent?['Groups','School','People']:['Groups','People']).map(t=>button(t,'tab',t===tab?'selected':'',`role="tab" aria-selected="${t===tab}" data-tab="${t}"`)).join('')}</div><div class="toolbar" ${tab==='School'?'hidden':''}><label class="search">${icon('search',15)}<input id="collab-search" value="${esc(query)}" placeholder="Search ${tab.toLowerCase()}" aria-label="Search ${tab.toLowerCase()}"></label><span class="spacer"></span>${tab==='Groups'?`<select id="collab-scope" aria-label="Groups to show"><option value="all" ${scope==='all'?'selected':''}>All groups</option><option value="joined" ${scope==='joined'?'selected':''}>My groups</option></select>`:''}</div>${tab==='School'?schoolSection():tab==='Groups'?groupsContent(groups):`<p class="collab-people-context">People from your groups${schoolVerified()?' and verified institution':''}</p><div class="collab-people">${people.map(p=>{const shared=personGroups(p.id).filter(g=>g.joined);return `<button class="collab-person" data-collab="person" data-id="${p.id}"><span class="avatar medium">${initials(p.name)}</span><span class="row-copy"><span>${esc(p.name)}</span><small>${esc(p.focus)}</small><small>${esc(shared.length?'You’re both in '+shared.map(g=>g.name).join(', '):'From your verified institution · New York University')}</small></span><small class="muted">${shared.length?shared.length+' shared '+(shared.length===1?'group':'groups'):'Same institution'}</small>${icon('right',14)}</button>`}).join('')||(isStudent&&!schoolVerified()?`<div class="empty"><h3>Find people at your school</h3><p>Verify your school email to discover classmates</p>${button('Verify school email','school-start','subtle')}</div>`:'<div class="empty">No people found</div>')}</div>${db.invites.length?`<section class="collab-invites"><h3>Invitations</h3>${db.invites.map(i=>`<div><span>${esc(i.email)}</span><small>${esc(db.groups.find(g=>g.id===i.group)?.name||'Group')}</small><span class="badge">Invited</span></div>`).join('')}</section>`:''}`}<div role="status" class="collab-status">${esc(notice)}</div>${modal()}</div>`;
}
export function bindCollab(root,redraw,active) {
  controller?.abort();if(!active)return;controller=new AbortController();const opts={signal:controller.signal};
  root.addEventListener('click',e=>{const el=e.target.closest('[data-collab]');if(!el)return;const action=el.dataset.collab;
    if(action==='tab'){tab=el.dataset.tab;query='';}
    else if(action==='school-start'){tab='School';close();notice='';}
    else if(action==='school-people')tab='People';
    else if(action==='school-reset'){db.schoolVerification=null;db.schoolEmail='';save();notice='';}
    else if(action==='accept-invite'||action==='decline-invite'){
      const invitation=db.incomingInvites.find(i=>i.id===el.dataset.id);if(!invitation||invitation.status!=='pending')return;
      const g=db.groups.find(g=>g.id===invitation.groupId);
      if(action==='accept-invite'&&g.school&&!schoolVerified()){tab='School';notice='Verify your school email, then return to accept this invitation';redraw();return;}
      invitation.status=action==='accept-invite'?'accepted':'declined';if(action==='accept-invite')g.joined=true;save();notice=action==='accept-invite'?'You joined '+g.name:'Invitation declined';
    }
    else if(action==='close')close();
    else if(action==='create'||action==='invite')dialog=action;
    else if(action==='group'||action==='person'){selected=el.dataset.id;dialog=action;if(action==='group'&&db.groups.find(g=>g.id===selected)?.school&&!db.groups.find(g=>g.id===selected)?.joined&&!schoolVerified())dialog='school-required';}
    else if(action==='join'||action==='leave'){const g=db.groups.find(g=>g.id===selected);if(action==='join'&&g.school&&!schoolVerified()){tab='School';close();redraw();return;}g.joined=action==='join';save();notice=action==='join'?'You joined '+g.name:'You left '+g.name;close();}
    redraw();
  },opts);
  root.addEventListener('input',e=>{if(e.target.id!=='collab-search')return;query=e.target.value;const pos=e.target.selectionStart;redraw();const input=root.querySelector('#collab-search');input.focus();input.setSelectionRange(pos,pos);},opts);
  root.addEventListener('change',e=>{if(e.target.id==='collab-scope'){scope=e.target.value;redraw();}},opts);
  root.addEventListener('submit',e=>{
    if(!e.target.id.startsWith('collab-'))return;e.preventDefault();const form=new FormData(e.target);
    if(e.target.id==='collab-school-email'){if(!requestSchoolCode(db,String(form.get('email')))){notice='We couldn’t match that email to an institution — check your school address';}else{save();notice='';}redraw();return;}
    if(e.target.id==='collab-school-code'){if(confirmSchoolCode(db,String(form.get('code')))){save();notice='';}else{notice='Check the code or restart verification if it has expired';}redraw();return;}
    if(e.target.id==='collab-create'){const name=String(form.get('name')).trim();if(!name)return;db.groups.push({id:crypto.randomUUID(),name,type:form.get('type'),school:String(form.get('school')).trim(),description:String(form.get('description')).trim(),people:[],joined:true,created:true,visibility:form.get('visibility')||'private'});notice='Group created';}
    if(e.target.id==='collab-invite'){const email=String(form.get('email')).trim(),group=String(form.get('group'));if(!db.groups.some(g=>g.id===group&&g.joined))return;if(!db.invites.some(i=>i.email.toLowerCase()===email.toLowerCase()&&i.group===group))db.invites.push({email,group});notice='Invitation added';}
    save();close();redraw();
  },opts);
  root.addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog){close();redraw();}},opts);
}
