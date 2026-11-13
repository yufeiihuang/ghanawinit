import { renderCollab, bindCollab } from './collab.js';
import { activeWorkspace, workspaceKey, ACTIVE_WORKSPACE_KEY } from './workspace-storage.js';
import { studentWorkspace, studentToday, seedStudentWorkspace } from './student-workspace.js';
import { navGroups, shortcuts, today, initialData, filterItems, calendarCells, connectorCategories, connectorCategory, roles, defaultRole, suggestedConnectors } from './data.js';
import { renderLibrary, bindLibrary } from './library.js';
import { icon, brand } from './icons.js';
import { renderStudentRoute, openCustomization, reloadOnboarding } from './onboarding.js';
import { readDraft, needsOnboarding } from './onboarding-state.js';

let STORAGE=workspaceKey('speqq-umami-v1');
if(activeWorkspace()==='student')seedStudentWorkspace(localStorage);
let db;
try { db=JSON.parse(localStorage.getItem(STORAGE)) || (activeWorkspace()==='student'?studentWorkspace():initialData()); } catch { db=activeWorkspace()==='student'?studentWorkspace():initialData(); }
// Add connectors introduced after a browser first saved its workspace.
if(Array.isArray(db.connectors)){const have=new Set(db.connectors.map(c=>c.title));for(const c of initialData().connectors)if(!have.has(c.title))db.connectors.push(c);}
const state={page:'Home',detail:null,query:'',sort:false,filter:'All',expanded:'goal-0',carousel:0,sidebar:window.innerWidth>650,modal:null,menu:null,chat:false,messages:[],month:10,year:2026,settingsTab:'Profile',specTab:'Overview',sources:false,memoryPeriod:'All time',memoryPerson:'Everyone',history:[],future:[]};
const app=document.querySelector('#app');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attr=esc;
const pageLabel=name=>db.kind==='student'?({Specs:'Documents',Agents:'Study routines',Memory:'Memories'}[name]||name):name;
const homeCards=()=>db.kind==='student'?studentToday:today;
const initials=()=>[db.profile.first,db.profile.last].map(n=>n?.[0]||'').join('');
const save=()=>localStorage.setItem(STORAGE,JSON.stringify(db));
const button=(label,action,cls='',extra='')=>`<button class="${cls}" data-action="${action}" ${extra}>${label}</button>`;
const ib=(name,action,label=name)=>button(icon(name),action,'icon-button',`aria-label="${attr(label)}" title="${attr(label)}"`);
const badge=(s,cls='')=>`<span class="badge ${cls}">${esc(s)}</span>`;
const avatars=s=>`<span class="avatars">${s.split(' ').map(n=>`<span class="avatar" title="${attr(n)}">${esc(n)}</span>`).join('')}</span>`;
const dataKey=()=>({Specs:'specs',Goals:'goals',Memory:'memories',Agents:'agents',Skills:'skills',Connectors:'connectors',Team:'team',Inbox:'inbox',Logs:'logs',Calendar:'events',Trash:'trash'})[state.page];
const current=()=>db[dataKey()]?.find(x=>x.id===state.detail);
const empty=(title,sub='Try a different search.')=>`<div class="empty">${icon(state.page,30)}<h3>${esc(title)}</h3><p>${esc(sub)}</p></div>`;

function navigate(page,detail=null,record=true){
 if(db.kind==='student'&&page==='Logs'){page='Home';detail=null;}
 if(record){state.history.push({page:state.page,detail:state.detail});state.future=[];}
 state.page=page;state.detail=detail;state.query='';state.filter='All';state.menu=null;state.modal=null;state.specTab='Overview';
 window.history.replaceState(null,'','#'+page+(detail?'/'+detail:''));
 render();document.querySelector('.main-scroll')?.scrollTo(0,0);
}
function sidebar(){
 const settings=state.page==='Settings';
 const groups=settings?[['',["Back to app"]],['Account',['Profile','Notifications']],['Workspace',['General','Team','Billing']],['Features',['Home','Goals','Specs','Agents','Skills','Memory']]]:navGroups;
 return `<aside class="sidebar ${state.sidebar?'':'collapsed'}"><div class="workspace-head">${button('<span class="workspace-logo">◒</span><strong>'+esc(db.workspace)+'</strong>'+icon('down',12),'workspace','workspace-button')}${ib('plus','quick-new','Create new')}</div><nav aria-label="Main navigation">${groups.map(([label,names])=>`${label?`<div class="nav-section">${label}</div>`:''}${names.filter(name=>db.kind!=='student'||name!=='Logs').map(name=>{
 const key=Object.keys(shortcuts).find(k=>shortcuts[k]===name);
 const active=settings?name===state.settingsTab:state.page===name;
 return button(`${icon(name==='Back to app'?'left':name==='Profile'?'user':name==='Notifications'?'bell':name==='General'?'globe':name==='Billing'?'Specs':name,15)}<span>${esc(pageLabel(name))}</span><span class="nav-key">${name==='Commands'?'⌘ K':key?'G '+key.toUpperCase():''}</span>${name==='Inbox'?`<span class="inbox-count">${db.inbox.filter(x=>x.unread).length}</span>`:''}`,'nav','nav-item '+(active?'active':''),`data-page="${name}" ${active?'aria-current="page"':''} title="${name}${key?' · G then '+key.toUpperCase():''}"`);
 }).join('')}`).join('')}</nav>${!settings?button('<span class="avatar">'+esc(initials())+'</span><span>'+esc(db.profile.first+' '+db.profile.last)+'</span><span class="spacer"></span>'+icon('down',12),'account','account'):''}</aside>`;
}
function header(){
 const d=current();
 return `<header class="topbar">${ib('sidebar','sidebar','Toggle sidebar')}${ib('left','back','Go back')}${ib('right','forward','Go forward')}<div class="breadcrumbs">${state.page!=='Home'?button(esc(pageLabel(state.page)),'breadcrumb'):''}${d?`${icon('right',12)}<span>${esc(d.title)}</span>${ib('star','favorite','Favorite')}`:''}${state.page==='Settings'?`${icon('right',12)}<span>${state.settingsTab}</span>`:''}</div>${ib('more','page-menu','Page actions')}<span class="spacer"></span>${state.page==='Specs'&&d?`<select aria-label="Version" data-change="version"><option>${esc(d.version)}</option><option>v3.0</option><option>v2.0</option></select><span class="spacer"></span>${avatars('PR DO')}${ib('chat','comment','Comments')}${button('Share','share','subtle')}${ib('sidebar','show-details','Spec details')}${ib('more','detail-menu','More spec actions')}`:''}</header>`;
}
function toolbar(){
 const actionNames={Specs:'New spec',Goals:'New goal',Memory:'New memory',Agents:'New agent',Skills:'Add skill',Team:'Invite'};
 let selection='';
 if(state.page==='Goals')selection=`<select aria-label="Goal quarter" data-change="quarter"><option>Q4 2026  4</option><option>Q3 2026</option><option>All quarters</option></select>`;
 if(state.page==='Skills')selection=`<select aria-label="Skills view" data-change="skill-filter"><option>My skills  ${db.skills.filter(x=>x.on).length}</option><option>All skills</option></select>`;
 if(state.page==='Team')selection=`<select aria-label="Team view" data-change="team-filter"><option>People  ${db.team.length}</option><option>Teams</option></select>`;
 if(state.page==='Connectors')selection=`<label class="connector-role-control"><span>For</span><select aria-label="Connector suggestions role" data-change="connector-role">${Object.keys(roles).map(role=>`<option ${role===(roles[db.profile.role]?db.profile.role:defaultRole)?'selected':''}>${esc(role)}</option>`).join('')}</select></label><select aria-label="Connector type" data-change="connector-filter">${['Connectors','Connected','Available'].map(value=>`<option ${(state.filter==='All'?'Connectors':state.filter)===value?'selected':''}>${value}</option>`).join('')}</select>`;
 return `<div class="toolbar"><label class="search">${icon('search',15)}<input id="list-search" aria-label="Search ${state.page.toLowerCase()}" placeholder="Search ${state.page.toLowerCase()}" value="${attr(state.query)}" autocomplete="off"></label><span class="spacer"></span>${selection}${ib('filter','filter','Filter')}${ib('sort','sort','Sort')}${actionNames[state.page]?button(icon('plus',15)+actionNames[state.page],'new','primary'):''}</div>${state.filter!=='All'?`<div class="active-filter">${button(esc(state.filter)+' ×','clear-filter','badge')}</div>`:''}`;
}
function home(){
 return `<div class="home"><a class="student-entry" href="${db.kind==='student'?'#Onboarding/customize':'#Onboarding'}">${icon('Memory',15)} ${db.kind==='student'?'Customize your study space':'Set up Speqq for studying'} ${icon('right',13)}</a><div class="greeting"><div class="eyebrow"><span class="workspace-logo">◒</span> ${esc(db.workspace)} <span>·</span> ${db.kind==='student'?'Thursday, Nov 12':'Wednesday, Nov 11'}</div><h1>Good evening, ${esc(db.profile.first)}</h1><p>${db.kind==='student'?'Your Cell Biology midterm is next Thursday<br class="desktop-break"> Review your notes and make time for chemistry practice':'Sprint planning at 4. v4.13 ships tomorrow with one<br class="desktop-break"> review left, and the Milestone 2 demo is due Friday.'}</p></div><div class="today-head"><strong>Today <span class="muted">${homeCards().length}</span></strong><span class="spacer"></span>${button(icon('Calendar',14)+' Calendar','open-calendar','calendar-link')}${ib('left','carousel-prev','Previous cards')}${ib('right','carousel-next','Next cards')}</div><div class="today-cards">${homeCards().slice(state.carousel,state.carousel+3).map((r,i)=>`<article class="today-card" tabindex="0" data-action="today" data-index="${state.carousel+i}"><div class="card-source">${brand(r[0])}<span>${r[1]}</span>${button(icon('check',12),'dismiss-today','card-check',`data-index="${state.carousel+i}" aria-label="Dismiss ${attr(r[2])}"`)}</div><h3>${esc(r[2])}</h3><footer><span class="status-dot ${r[5]}">${esc(r[3])}</span><span>${esc(r[4])}</span></footer></article>`).join('')}</div></div>`;
}
function rows(){
 let list=filterItems(db[dataKey()]||[],state.query);
 if(state.sort)list=[...list].reverse();
 if(state.filter!=='All')list=list.filter(r=>[r.type,r.status,r.role,r.unread?'Unread':'Read'].includes(state.filter));
 if(!list.length)return empty(state.query?'No results found':state.page==='Trash'?'Trash is empty':'Nothing here yet',state.query?'Try a different search.':'Items will appear here when you add them.');
 return `<div class="rows">${list.map(r=>{
 let left='',right='',body='';
 switch(state.page){
 case 'Inbox':left=brand(r.source)+`<span class="row-title">${esc(r.title)}</span>`;right=badge(r.unread?'Unread':'Read',r.unread?'bright':'')+badge(r.type)+badge(r.time);break;
 case 'Specs':left=icon('Specs',16)+`<span class="row-title">${esc(r.title)}</span>`;right=button(icon('chat',13)+' Ask','ask-item','ask-row',`data-id="${r.id}"`)+(r.private?badge('Private'):'')+`<span class="muted">${r.date}</span>${avatars('SR')}`;break;
 case 'Goals':left=brand(r.source)+`<span class="row-title">${esc(r.title)}</span>`;right=badge('♧ '+r.team)+badge(r.progress+'%')+badge(r.status)+badge(r.date)+avatars(r.people);if(state.expanded===r.id)body=`<div class="goal-body"><div class="metric">${badge(r.metric)} ${badge(r.value)} ${badge('⬡ Whole product')}</div><p>${esc(r.summary)}</p>${r.actions.map(a=>`<div class="goal-action"><span>→</span><span>${esc(a)}</span>${button('Ask','ask-text','badge',`data-text="${attr(a)}"`)}</div>`).join('')}</div>`;break;
 case 'Memory':left=`<span class="memory-icon">${icon('Memory',22)}</span><span class="row-copy"><span>${esc(r.title)} <span class="muted">@${esc(r.handle)}</span> ${r.private?icon('lock',12):''}</span><small>${esc(r.description)}</small></span>`;right=avatars(r.people)+`<span class="muted">${r.time}</span>`;break;
 case 'Agents':left=`<span class="row-title">${esc(r.title)}</span>`;right=badge((r.trigger.includes('AM')||r.trigger.includes('PM')?'◷ ':'ϟ ')+r.trigger)+`<span class="muted ${r.status==='Running'?'blue':''}">${esc(r.status)}</span>`;break;
 case 'Skills':left=icon('Skills',18)+`<span class="row-title">${esc(r.title)}</span>${r.scripts?badge('Scripts'):''}`;right=`<span class="muted">${r.author}</span>`+(r.author!=='Speqq'?avatars(r.author==='umami-software'?'PR':'SR'):'')+`<button class="switch ${r.on?'on':''}" role="switch" aria-checked="${r.on}" aria-label="Enable ${r.title}" data-action="toggle-skill" data-id="${r.id}"><span></span></button>`;break;
 case 'Team':left=`<span class="avatar medium">${r.initials}</span><span class="row-copy"><span>${esc(r.title)} ${r.initials==='SR'?badge('You'):''}</span><small>${esc(r.description)}</small></span>`;right=badge(r.tag)+badge(r.role);break;
 case 'Logs':left=icon(r.status==='Running'?'refresh':'Logs',16)+`<span class="row-title">${esc(r.title)}</span><span class="muted">${esc(r.description)}</span>`;right=badge(r.status,r.status==='Failed'?'red':r.status==='Running'?'blue':'')+`<span class="muted">${r.duration}</span><span class="muted">${r.date}</span>`;break;
 case 'Trash':left=icon(r.kind||'Specs')+`<span class="row-title">${esc(r.title)}</span>`;right=button('Restore','restore','subtle',`data-id="${r.id}"`);break;
 }
 return `<article class="row-wrap ${state.page==='Memory'?'memory-row':''}"><div class="row" tabindex="0" data-action="open-item" data-id="${r.id}">${left}<span class="spacer"></span><div class="row-meta">${right}</div>${!['Skills','Memory','Trash','Logs'].includes(state.page)?button(icon('more'),'row-menu','icon-button row-more',`data-id="${r.id}" aria-label="Actions for ${attr(r.title)}"`):''}</div>${body}</article>`;
 }).join('')}</div>`;
}
function connectorView(){
 let list=filterItems(db.connectors,state.query);
 if(state.sort)list.reverse();
 const role=roles[db.profile.role]?db.profile.role:defaultRole;
 const card=r=>`<button class="connector-card" data-action="open-item" data-id="${r.id}">${brand(r.title)}<span class="row-copy"><span>${esc(r.title)}</span><small>${esc(r.description)}</small></span><span class="badge ${r.connected?'connected':''}">${r.connected?'✓ Connected':'Connect'}</span>${icon('right',14)}</button>`;
 const section=(title,items,extra='',cls='')=>items.length?`<section class="connector-section ${cls}"><h3>${title}${extra}</h3><div class="connector-grid">${items.map(card).join('')}</div></section>`:'';
 const showAvailable=state.filter!=='Connected',showConnected=state.filter!=='Available';
 const suggested=showAvailable?suggestedConnectors(db.connectors,role).filter(r=>list.includes(r)):[];
 const available=list.filter(r=>!r.connected&&!suggested.includes(r));
 const groups=connectorCategories.map(([name])=>section(name,available.filter(r=>connectorCategory(r.title)===name))).join('');
 return [
  section('Suggested',suggested,'','suggested'),
  showConnected?section('Connected',list.filter(r=>r.connected)):'',
  showAvailable&&groups?`<section class="connector-section"><h3>Available</h3><div class="connector-subsections">${groups}</div></section>`:''
 ].join('')||empty('No connectors found');
}
function calendar(){
 const colors={Meeting:'gray',Release:'blue',Milestone:'teal',Spec:'purple',Goal:'yellow',Launch:'green'};
 const monthLabel=new Date(state.year,state.month).toLocaleString('en-US',{month:'long',year:'numeric'});
 return `<div class="calendar-toolbar"><strong>${monthLabel}</strong>${ib('left','month-prev','Previous month')}${ib('right','month-next','Next month')}<span class="spacer"></span><select aria-label="Event type" data-change="event-filter">${['All types','Meeting','Release','Milestone','Spec','Goal','Launch'].map(t=>`<option ${state.filter===t?'selected':''}>${t}</option>`).join('')}</select>${button(icon('plus',15)+' Add event','new','primary')}</div><div class="calendar-grid"><div class="weekdays">${['SUN','MON','TUE','WED','THU','FRI','SAT'].map(t=>`<div>${t}</div>`).join('')}</div><div class="calendar-days">${calendarCells(state.year,state.month).map(c=>`<div class="day ${!c.current?'other-month':''}"><span class="day-num ${c.current&&c.day===11&&state.month===10?'today':''}">${c.day}</span>${state.month===10?db.events.filter(e=>e.day===c.index&&(state.filter==='All'||state.filter==='All types'||e.type===state.filter)).map(e=>`<button class="calendar-event ${colors[e.type]}" data-action="open-item" data-id="${e.id}" title="${attr(e.title)}">${esc(e.title)}</button>`).join(''):''}</div>`).join('')}</div></div><div class="agenda"><h3>This week <span class="muted">Nov 9 – 15</span></h3>${db.events.filter(e=>e.day<16).map(e=>`<button class="agenda-row" data-action="open-item" data-id="${e.id}"><span class="agenda-date">${e.day===11?'TODAY':'NOV'}<strong>${e.day}</strong></span><span class="row-copy"><span>${e.title}</span><small>${e.description}</small></span><span class="spacer"></span>${badge(e.type)}</button>`).join('')}</div>`;
}
function specDetail(r){
 const tabs=['Overview','Implementation notes','Requirements','Test plan',...(r.tabs||[])];
 const overview=`<h1>Visits split at the top of the hour</h1><h2>Problem</h2><p>On sites where each page is a full page load, a visitor who keeps browsing past the top of the hour is counted as two visits. Each page load starts the tracker without its saved visit, so the server ties the visit to the clock hour. The second visit often has one view, so it also counts as a bounce: bounce rate goes up and visit duration goes down.</p><h2>Steps to reproduce</h2><ol><li>On a site where every page is a full page load, open a page at 10:58.</li><li>Open a second page at 11:02.</li><li>Open Sessions for the website and find that session.</li></ol><h2>Expected</h2><p>The session shows one visit with two views. A visit ends only after 30 minutes without activity.</p>`;
 let content=r.content?.[state.specTab];
 if(content===undefined) content=r.id==='spec-0'&&state.specTab==='Overview'?overview:state.specTab==='Overview'?`<h1>${esc(r.title)}</h1><h2>Problem</h2><p>Describe the problem this spec solves.</p><h2>Expected</h2><p>Describe the expected behavior.</p>`:state.specTab==='Requirements'?`<h1>Requirements</h1><p>Track the requirements for ${esc(r.title)}.</p><ul><li>Preserve the current session across page loads.</li><li>End a visit after 30 minutes without activity.</li></ul>`:state.specTab==='Test plan'?'<h1>Test plan</h1><ol><li>Open the site in a new session.</li><li>Follow the steps to reproduce.</li><li>Confirm that the expected behavior matches.</li></ol>':'<h1>'+esc(state.specTab)+'</h1><p>Add your notes here.</p>';
 return `<div class="spec-layout"><aside class="spec-tabs">${tabs.map((t,i)=>button(icon(i===2?'Inbox':'Specs',14)+esc(t),'spec-tab',state.specTab===t?'selected':'',`data-tab="${attr(t)}"`)).join('')}${button(icon('plus',15)+' Add tab','add-tab','muted')}</aside><article class="spec-document" contenteditable="true" role="textbox" aria-label="Spec content" data-editor="spec" spellcheck="false">${content}</article><aside class="details"><div class="details-head">${icon('sidebar',14)} Details<span class="spacer"></span>${ib('close','hide-details','Hide details')}</div><div class="properties">${[['Specs','Title',r.title],['Commands','ID','5bfa284c'],['refresh','Status',`<select aria-label="Spec status" data-change="status">${['Draft','In review','Approved','Published','Archived'].map(s=>`<option ${r.status===s?'selected':''}>${s}</option>`).join('')}</select>`],['Goals','Version',r.version],['Goals','Review','Not reviewed'],['branch','Branch','Add branch'],['user','Assignee','Add assignee'],['user','Created by',db.profile.first+' '+db.profile.last],['Calendar','Created','Oct 4, 2026'],['clock','Updated','Oct 4, 2026'],['globe','Visibility',r.private?'Private':'Private'],['Inbox','Queue','Not queued']].map(([i,label,v])=>`<div class="property">${icon(i,14)}<span>${label}</span><span class="property-value" title="${label==='Title'?attr(v):''}">${label==='Status'?v:esc(v)}</span></div>`).join('')}<hr><div class="property"><strong>Tags</strong><span class="spacer"></span>${button('+ Add tag','add-tag','muted')}</div><div class="tags">${(r.tags||[]).map(t=>badge(t)).join('')||'<span class="muted">No tags assigned</span>'}</div></div>${button(icon('Trash',14)+' Delete spec','delete-current','danger delete-spec')}</aside></div>`;
}
function memoryDetail(r){
 if(db.kind==='student')return `<h1>${esc(r.title)}</h1><section class="panel"><h3>Electrochemical gradients → ATP synthesis</h3><p>The same gradient principle appears in chemistry and cell biology. Protons flow down an electrochemical gradient through ATP synthase to help produce ATP.</p><span class="muted">General Chemistry · Cell Biology</span></section><section class="panel"><h3>Revisit your source notes</h3><p>Compare the chemistry and membrane transport notes in your Library.</p>${button('Open Library','student-library','subtle')}</section>`;

 const summary=r.id==='memory-0'?`Billing is moving from the old invoice service to Stripe. The schema is in place and test customers are seeded. Proration works for upgrades and same-cycle changes, and annual plans will get prorated refunds rather than credits, as agreed with finance. Webhook retries now run through a queue, so timeouts no longer drop events.<br><br>Open: annual-to-monthly downgrades leave a negative balance the invoice builder can’t handle yet, and invoice emails send twice when a retry succeeds (BILL-219). Next up is wiring the customer portal.`:esc(r.description);
 return `<section class="memory-summary"><div><h3>${esc(r.title)}</h3><p>${summary}</p><small class="muted">Updated ${esc(r.time)}</small></div>${button('@'+esc(r.handle)+' '+icon('copy',13),'copy-handle','subtle',`data-text="@${attr(r.handle)}"`)}</section><div class="memory-controls"><div class="segmented">${['Today','7 days','30 days','All time'].map(t=>button(t,'memory-period',state.memoryPeriod===t?'selected':'',`data-period="${t}"`)).join('')}</div>${['Everyone','Justin','You','Priya','Dana'].map(t=>button(t,'memory-person',state.memoryPerson===t?'selected pill':'muted',`data-person="${t}"`)).join('')}<span class="spacer"></span><small class="muted">🔵 1 new since your last visit</small></div><div class="timeline"><h3>Today <span class="muted">2</span></h3><article class="panel"><p>Webhook retries now run through a queue, so Stripe timeouts no longer drop events. Justin moved the retry logic out of the request path in stripe.ts and tied it to BILL-212; retries back off for up to an hour before giving up and alerting. Separately, Sam settled the open refund question with finance: annual plans get prorated refunds, not account credits. The pricing spec is updated to match.</p><details open><summary>Show entries</summary><div class="timeline-entry">${avatars('JP')} Moved webhook retries to a queue so Stripe timeouts stop dropping events. <span class="muted">2:14 PM</span></div><div class="timeline-entry">${avatars('SR')} Decided annual plans get prorated refunds, not credits. <span class="muted">11:02 AM</span></div></details></article>${state.memoryPeriod!=='Today'?`<h3>Yesterday <span class="muted">2</span></h3><article class="panel"><p>Sam’s Codex session added the proration calculation and its tests in #2431, covering upgrades and same-cycle plan changes. One edge case remains: downgrading from annual to monthly mid-cycle produces a negative balance that the invoice builder doesn’t handle yet.</p><details><summary>Show 2 entries</summary><p>Priya logged the duplicate invoice email bug as BILL-219.</p></details></article>`:''}<h3>Related</h3>${button(icon('Specs')+' Session management '+badge('Spec'),'related-spec','related-row')}</div>`;
}
function genericDetail(r){
 if(state.page==='Connectors')return `<div class="detail-heading">${brand(r.title)}<div><h1>${esc(r.title)}</h1><p class="muted">${esc(r.description)}</p></div><span class="spacer"></span>${button(r.connected?'Disconnect':'Connect','toggle-connector',r.connected?'subtle':'primary')}</div><section class="panel"><h3>${r.connected?'Connection':'Connect '+r.title}</h3><p>${r.connected?'Connected to '+esc(db.workspace)+'. Your workspace can search and reference this source.':'Add this source to your workspace to bring your product knowledge together.'}</p><div class="property"><span>Status</span><span class="spacer"></span>${badge(r.connected?'✓ Connected':'Not connected',r.connected?'connected':'')}</div>${r.connected?`<div class="property"><span>Last synced</span><span class="spacer"></span><span class="muted">Just now</span></div>${button(icon('refresh',14)+' Sync now','sync-connector','subtle')}`:''}</section>`;
 if(state.page==='Inbox')return `<div class="detail-heading">${brand(r.source)}<h1>${esc(r.title)}</h1></div><div class="inline-meta">${badge(r.type)}${badge(r.time)}${button(r.unread?'Mark as read':'Mark as unread','toggle-read','subtle')}</div><article class="panel"><p>${r.type==='Mention'?'Dana Okafor asked: “Can you confirm the refresh window is 5 min?”':esc(r.title)}</p><p class="muted">${r.source} · ${db.workspace}</p>${button('Ask about this','ask-current','primary')}${r.type==='Approval'?button('Approve','approve','subtle'):''}</article>`;
 if(state.page==='Agents')return `<div class="detail-heading">${icon('Agents',30)}<h1 contenteditable="true" data-editor="title" role="textbox" aria-label="Agent name">${esc(r.title)}</h1><span class="spacer"></span>${button(r.on?'Enabled':'Off','toggle-agent','subtle')}${button('Run now','run-agent','primary')}</div><section class="panel form-panel"><h3>Trigger</h3><p>${esc(r.description)}</p><label>When to run<select data-change="agent-trigger" aria-label="Agent trigger"><option>${esc(r.trigger)}</option><option>Every day at 9:00 AM</option><option>Every Friday at 4:00 PM</option><option>When a Linear issue is labeled bug</option></select></label><h3>Instructions</h3><textarea aria-label="Agent instructions" data-input="agent-instructions" rows="6" placeholder="What should this agent do?">${esc(r.instructions||'Search the workspace for relevant updates, summarize what changed, and include links to the sources.')}</textarea><h3>Skills</h3><div class="inline-meta">${db.skills.filter(s=>s.on).slice(0,3).map(s=>badge(s.title)).join('')}</div></section><h3>Recent runs</h3><div class="panel">${esc(r.status)}</div>`;
 if(state.page==='Skills')return `<div class="detail-heading">${icon('Skills',30)}<h1>${esc(r.title)}</h1><span class="spacer"></span>${button(r.on?'Remove from My skills':'Add to My skills','toggle-current-skill','primary')}</div><p class="muted">By ${esc(r.author)}</p><section class="panel"><h3>${esc(r.title)}</h3><p>${r.title==='search-knowledge'?'Search across connected sources and return answers grounded in your product knowledge.':r.title==='write-spec'?'Write clear, actionable product specifications grounded in workspace context.':'Give your agents the context and tools they need for this task.'}</p>${r.scripts?badge('Includes scripts your agent can run'):''}</section>`;
 if(state.page==='Team')return `<div class="detail-heading">${avatars(r.initials)}<h1>${esc(r.title)}</h1><span class="spacer"></span>${badge(r.role)}</div><section class="panel"><h3>${esc(r.description)}</h3><p>${esc(r.tag)}</p><label>Role <select aria-label="Member role" data-change="role">${['Admin','Member','Invited'].map(t=>`<option ${r.role===t?'selected':''}>${t}</option>`).join('')}</select></label></section>`;
 if(state.page==='Logs')return `<h1>${esc(r.title)}</h1><div class="inline-meta">${badge(r.status)}${badge(r.duration)}${badge(r.date)}</div><section class="panel"><h3>${esc(r.description)}</h3><pre class="log-output">${r.status==='Failed'?'ERROR  Linear API request failed.\n       Connection timed out. Retry the sync to continue.':r.status==='Running'?'INFO  Sync started\nINFO  Fetching commits from umami-software/umami…':'INFO  Run started\nINFO  Source loaded\nINFO  Processing completed\nOK    Run completed successfully'}</pre>${r.status==='Failed'?button('Retry','retry-log','primary'):''}</section>`;
 if(state.page==='Calendar')return `<div class="detail-heading">${icon('Calendar',28)}<h1>${esc(r.title)}</h1></div><div class="inline-meta">${badge(r.type)}${badge('November '+r.day+', 2026')}</div><section class="panel"><p>${esc(r.description)}</p><h3>Participants</h3>${avatars('SR PR DO ML')}${button('Ask about this event','ask-current','subtle')}</section>`;
 return '';
}
function settings(){
 const t=state.settingsTab;
 if(t==='Profile')return `<div class="page-title"><h1>Profile</h1><span class="spacer"></span>${button('Save','save-profile','primary')}</div><h3>Account</h3><div class="panel profile-card"><span class="avatar large">SR</span><div><h3>${esc(db.profile.first+' '+db.profile.last)}</h3><p class="muted">sam@umami.is</p></div><span class="spacer"></span>${button('Change picture','change-picture','subtle')}</div><section class="panel profile-fields"><label>First name<input aria-label="First name" id="first-name" value="${attr(db.profile.first)}"></label><label>Last name<input aria-label="Last name" id="last-name" value="${attr(db.profile.last)}"></label><label>Email<span>sam@umami.is</span></label><label><span>Username<small>3–20 lowercase letters, numbers, or underscores.</small></span><input aria-label="Username" id="username" value="${attr(db.profile.username)}" minlength="3" maxlength="20" pattern="[a-z0-9_]+"></label><label><span>Role<small>Used to suggest connectors.</small></span><select aria-label="Role" id="role">${Object.keys(roles).map(r=>`<option${r===(db.profile.role||defaultRole)?' selected':''}>${r}</option>`).join('')}</select></label></section>`;
 if(t==='General')return `<div class="page-title"><h1>General</h1><span class="spacer"></span>${button('Save','save-workspace','primary')}</div><section class="panel profile-fields"><label>Workspace name<input id="workspace-name" aria-label="Workspace name" value="${attr(db.workspace)}"></label><label>Workspace URL<span class="muted">umami.speqq.com</span></label></section>`;
 if(t==='Notifications')return `<h1>Notifications</h1><section class="panel profile-fields">${['Email notifications','Desktop notifications','Spec reviews','Agent approvals','Goal updates'].map((n,i)=>`<label>${n}<input type="checkbox" data-preference="notification-${i}" ${db['notification-'+i]!==false?'checked':''}></label>`).join('')}</section>`;
 if(t==='Billing')return `<h1>Billing</h1><section class="panel"><h3>Workspace plan</h3><p>Pro</p><p class="muted">Manage the plan for ${esc(db.workspace)}.</p>${badge('Active')}</section>`;
 return `<h1>${t}</h1><section class="panel"><h3>${t} settings</h3><p class="muted">Manage ${t.toLowerCase()} for your workspace.</p><label class="setting-toggle">Enable ${t}<input type="checkbox" data-preference="feature-${t}" ${db['feature-'+t]!==false?'checked':''}></label>${t==='Team'?button('Manage team','settings-team','subtle'):''}</section>`;
}
function content(){
 if(state.page==='Collab')return renderCollab(db);
 if(state.page==='Library')return renderLibrary();
 if(state.page==='Home')return home();
 if(state.page==='Settings')return `<div class="page settings-page">${settings()}</div>`;
 const r=current();
 if(r&&state.page==='Specs')return specDetail(r);
 if(r)return `<div class="page detail-page">${state.page==='Memory'?memoryDetail(r):genericDetail(r)}</div>`;
 return `<div class="page"><h1>${esc(pageLabel(state.page))}</h1>${state.page==='Calendar'?calendar():toolbar()+(state.page==='Connectors'?connectorView():state.page==='Logs'?`<div class="runs-chart"><div>Runs <span class="muted">12</span></div><div class="chart-bars">${Array.from({length:64},(_,i)=>`<span style="height:${5+(i*17%55)}px"></span>`).join('')}</div><div class="chart-axis"><span>Oct 5 12:24</span><span>Oct 6 00:24</span><span>Oct 6 12:24</span></div></div>${rows()}`:rows())}</div>`;
}
function composer(){
 if(['Settings','Library','Collab'].includes(state.page))return '';
 return `<div class="ask-dock ${state.chat?'is-chat':''} ${state.chatExpanded?'expanded':''}">${state.chat?`<section class="chat-window"><header>${icon('chat',16)}<strong>Ask Speqq</strong><span class="spacer"></span>${ib('check','like-answer','Helpful answer')}${ib('minus','minimize-chat','Minimize')}${ib('expand','expand-chat','Expand')}${ib('close','close-chat','Close conversation')}</header><div class="messages">${state.messages.map(m=>m.role==='user'?`<div class="user-message">${esc(m.text)}</div>`:`<div class="answer"><p>${esc(m.text)}</p><div class="source-chips">${db.kind==='student'?badge('Library · Membrane transport')+badge('Library · Electrochemical gradients'):badge('◕ #2417')+badge('◒ WEB-1182')+badge('◕ session.ts')}</div>${button(icon('down',12)+' All 7 sources','sources','sources-button')}${state.sources?`<div class="sources-list">${['GitHub · #2417 Fix concurrent session refresh','Linear · WEB-1182','GitHub · src/lib/session.ts','Spec · Session management','Slack · #umami-team','Memory · Session refresh','GitHub · #2421'].map(s=>`<div>${esc(s)}</div>`).join('')}</div>`:''}</div>`).join('')}</div></section>`:''}<form id="ask-form" class="composer">${ib('plus','attach','Add context')}<input name="question" id="ask-input" aria-label="${state.chat?'Ask a follow-up':'Ask about '+esc(db.workspace)}" placeholder="${state.chat?'Ask a follow-up':'Ask about '+esc(db.workspace)}" autocomplete="off">${!state.chat?ib('chat','open-chat','Open Ask Speqq'):''}${ib('down','ask-options','Question options')}<button class="send" type="submit" aria-label="Send question">${icon('arrow',20)}</button></form></div>`;
}
function menus(){
 if(!state.menu)return '';
 const m=state.menu;
 let options=[];
 if(m.type==='filter') options=['All',...(state.page==='Inbox'?['Unread','Read','Alert','Review','Mention','Approval']:state.page==='Goals'?['At risk','Off track','Hit']:state.page==='Connectors'?['Connected','Available']:state.page==='Logs'?['Running','Failed','Completed']:state.page==='Team'?['Admin','Member','Invited']:['Draft','In review','Approved'])].map(t=>[t,'choose-filter',`data-filter="${t}"`]);
 else if(m.type==='workspace')options=[['Umami'+(activeWorkspace()==='umami'?'  ✓':''),'switch-workspace','data-workspace="umami"'],['Yufei’s study space'+(activeWorkspace()==='student'?'  ✓':''),'switch-workspace','data-workspace="student"'],['Workspace settings','workspace-settings'],['Create workspace','create-workspace']];
 else if(m.type==='account')options=[[db.profile.first+' '+db.profile.last,'close-menu'],['Profile','profile'],['Customize Speqq','customize-speqq'],['Settings','workspace-settings']];
 else if(m.type==='quick')options=[['New spec','quick-spec'],['New goal','quick-goal'],['New memory','quick-memory'],['New agent','quick-agent']];
 else if(m.type==='ask')options=[['Search all sources  ✓','close-menu'],['Include workspace memory  ✓','close-menu']];
 else if(m.type==='attach')options=[['Add a spec','attach-spec'],['Add project memory','attach-memory'],['Search connected sources','attach-connectors']];
 else options=[['Ask about this','menu-ask'],...(state.page==='Inbox'?[['Mark as read','menu-read'],['Mark all as read','read-all']]:[]),['Rename','rename'],['Move to trash','delete-menu']];
 const placement=m.type==='account'
  ? `bottom:${m.bottom}px;left:${m.x}px;width:${m.width}px;min-width:0;max-width:none`
  : `top:${Math.min(m.y||60,window.innerHeight-240)}px;left:${Math.min(m.x||260,window.innerWidth-235)}px`;
 return `<div class="menu-scrim" data-action="close-menu"></div><div class="popup-menu" style="${placement}" role="menu">${options.map(([t,a,attrs])=>button(esc(t),a,t.includes('trash')?'danger':'',attrs||'')).join('')}</div>`;
}
function modal(){
 if(!state.modal)return '';
 const m=state.modal;
 if(m.type==='commands'){
 const commands=[['Ask Speqq','open-chat'],['Navigation: Go home','command-home'],['Sidebar: Toggle sidebar','sidebar'],['Inbox: Open inbox','command-Inbox'],['Inbox: Mark all as read','read-all'],...['Goals','Specs','Memory','Agents','Skills','Connectors','Collab','Logs','Trash','Settings'].filter(n=>db.kind!=='student'||n!=='Logs').map(n=>[n+': Open '+n.toLowerCase(),'command-'+n]),['Specs: New spec','quick-spec'],['Goals: New goal','quick-goal'],['Agents: New agent','quick-agent']];
 return `<div class="modal-backdrop" data-action="close-modal"></div><section class="command-dialog" role="dialog" aria-modal="true" aria-label="Commands"><div class="command-search"><input id="command-search" aria-label="Select a command" placeholder="Select a command…" autofocus>${ib('close','close-modal','Close commands')}</div><div class="command-results"><small>Recent</small>${button(icon('Specs')+'Navigation — get back to where you were'+badge('Spec'),'recent-spec','command-option')}<small>Commands</small>${commands.map(([t,a])=>button(esc(t),a,'command-option',`data-command="${attr(t.toLowerCase())}"`)).join('')}</div><footer>↑↓ to navigate　 ↵ to use　 esc to dismiss</footer></section>`;
 }
 if(m.type==='share')return `<div class="modal-backdrop" data-action="close-modal"></div><section class="dialog" role="dialog" aria-modal="true" aria-label="Share spec"><div class="dialog-heading"><h2>Share ${esc(current()?.title||'spec')}</h2>${ib('close','close-modal','Close share')}</div><label>Invite people<input placeholder="Email address" type="email" id="share-email"></label><div class="share-person">${avatars('SR')}Sam Rivera<span class="spacer"></span>${badge('Owner')}</div><div class="dialog-footer">${button(icon('copy',14)+' Copy link','copy-link','subtle')}${button('Done','close-modal','primary')}</div></section>`;
 const title=m.title||({Specs:'New spec',Goals:'New goal',Memory:'New memory',Agents:'New agent',Skills:'Add skill',Team:'Invite people',Calendar:'Add event'})[state.page]||'Create';
 const type=m.type;
 return `<div class="modal-backdrop" data-action="close-modal"></div><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="dialog-heading"><h2 id="dialog-title">${esc(title)}</h2>${ib('close','close-modal','Close dialog')}</div><form id="edit-form"><label>${type==='invite'?'Email address':type==='add-tag'?'Tag name':type==='add-tab'?'Tab name':'Name'}<input name="title" aria-label="${type==='invite'?'Email address':'Name'}" placeholder="${type==='invite'?'name@company.com':title}" value="${attr(m.value||'')}" ${type==='invite'?'type="email"':''} required autofocus></label>${['create','event','invite'].includes(type)?`<label>${type==='invite'?'Role':'Description'}${type==='invite'?'<select name="role"><option>Member</option><option>Admin</option></select>':'<textarea name="description" rows="3" placeholder="Add a description…"></textarea>'}</label>`:''}${type==='event'?`<div class="form-columns"><label>Date<input type="date" name="date" value="2026-11-11" required></label><label>Type<select name="eventType">${['Meeting','Release','Milestone','Spec','Goal','Launch'].map(t=>`<option>${t}</option>`).join('')}</select></label></div>`:''}<div class="dialog-footer">${button('Cancel','close-modal','subtle')}<button class="primary" type="submit">${['rename','add-tag','add-tab'].includes(type)?'Save':type==='invite'?'Invite':'Create'}</button></div></form></section>`;
}
function render(){
 if(db.kind==='student'&&state.page==='Logs'){state.page='Home';state.detail=null;window.history.replaceState(null,'','#Home');}
 if(needsOnboarding(readDraft(localStorage), location.hash)) window.history.replaceState(null,'','#Onboarding');
 if(renderStudentRoute(app)){bindLibrary(app,render,false);bindCollab(app,render,false);return;}
 app.innerHTML=`${sidebar()}<main class="main ${state.sidebar?'':'full'} ${db.kind==='student'?'student-workspace-view':''}">${header()}<div class="main-scroll">${content()}</div>${composer()}</main>${menus()}${modal()}<div id="toast" role="status"></div>`;
 bindLibrary(app,render,state.page==='Library');
 bindCollab(app,render,state.page==='Collab');
 if(state.modal)setTimeout(()=>document.querySelector('#command-search,.dialog input')?.focus(),0);
 document.title=(state.detail?current()?.title:pageLabel(state.page))+' · '+db.workspace;
}
// Preserve ordinary document formatting while rejecting executable pasted markup.
function sanitizeDocument(html){
 const doc=new DOMParser().parseFromString(html,'text/html');
 doc.querySelectorAll('script,style,iframe,object,embed,form,input,button,svg,math').forEach(el=>el.remove());
 doc.querySelectorAll('*').forEach(el=>{for(const attribute of [...el.attributes]){if(attribute.name.startsWith('on')||['src','srcdoc','style'].includes(attribute.name)||(attribute.name==='href'&&!/^https?:\/\//i.test(attribute.value)))el.removeAttribute(attribute.name);}});
 return doc.body.innerHTML;
}
function toast(text){const t=document.querySelector('#toast');t.textContent=text;t.classList.add('visible');clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>t.classList.remove('visible'),2300);}
function openMenu(type,e,id){const r=e?.getBoundingClientRect();state.menu={type,id,x:r?.left??260,y:r?r.bottom+5:60,bottom:r?window.innerHeight-r.top+8:8,width:r?.width};render();}
function create(){if(state.page==='Collab'){document.querySelector('[data-collab="create"],[data-collab="invite"]')?.click();return;}if(state.page==='Library'){document.querySelector('[data-lib="new"]')?.click();return;}state.modal={type:state.page==='Team'?'invite':state.page==='Calendar'?'event':'create'};state.menu=null;render();}
function deleteItem(id){const key=dataKey();const item=db[key]?.find(r=>r.id===id);if(!item)return;db[key]=db[key].filter(r=>r.id!==id);db.trash.push({...item,kind:state.page,key});save();state.detail=null;state.menu=null;render();toast('Moved to trash');}
function ask(text){if(!text.trim())return;if(db.kind==='student'){state.chat=true;state.messages.push({role:'user',text:text.trim()},{role:'assistant',text:'Your chemistry and biology notes share a useful idea: electrochemical gradients. Review how proton flow through ATP synthase converts stored energy into ATP, then test yourself on membrane transport before your Cell Biology midterm.'});render();document.querySelector('#ask-input')?.focus();return;}state.chat=true;state.messages.push({role:'user',text:text.trim()},{role:'assistant',text:/billing|invoice|stripe/i.test(text)?'Billing v2 is moving to Stripe. Webhook retries now run through a queue. The remaining issues are annual-to-monthly downgrades and duplicate invoice emails (BILL-219).':/release|v4|2431/i.test(text)?'v4.13 ships tomorrow. Review #2431 is still open and blocks the release. Dana and Priya are on the release; the Milestone 2 demo is due Friday.':'Sessions refresh in refreshSession, 5 minutes before the access token expires. Two tabs refreshing at once is the open bug; #2417 fixes it.'});render();document.querySelector('#ask-input')?.focus();}

app.addEventListener('click',async e=>{
 const el=e.target.closest('[data-action]');if(!el)return;
 const a=el.dataset.action,id=el.dataset.id,r=current();
 if(a==='nav'){const p=el.dataset.page;if(p==='Commands'){state.modal={type:'commands'};render();}else if(state.page==='Settings'&&p!=='Back to app'){state.settingsTab=p;render();}else navigate(p==='Back to app'?'Home':p);return;}
 if(a.startsWith('command-')){navigate(a.slice(8)==='home'?'Home':a.slice(8));return;}
 if(a.startsWith('quick-')){navigate(({spec:'Specs',goal:'Goals',memory:'Memory',agent:'Agents'})[a.slice(6)]);create();return;}
 switch(a){
 case 'student-library':navigate('Library');break;
 case 'sidebar':state.sidebar=!state.sidebar;state.modal=null;render();break;
 case 'back':{const prev=state.history.pop();if(prev){state.future.push({page:state.page,detail:state.detail});navigate(prev.page,prev.detail,false);}break;}
 case 'forward':{const next=state.future.pop();if(next){state.history.push({page:state.page,detail:state.detail});navigate(next.page,next.detail,false);}break;}
 case 'breadcrumb':navigate(state.page);break;
 case 'switch-workspace':{save();localStorage.setItem(ACTIVE_WORKSPACE_KEY,el.dataset.workspace);if(el.dataset.workspace==='student')seedStudentWorkspace(localStorage);STORAGE=workspaceKey('speqq-umami-v1');try{db=JSON.parse(localStorage.getItem(STORAGE))||(el.dataset.workspace==='student'?studentWorkspace():initialData());}catch{db=el.dataset.workspace==='student'?studentWorkspace():initialData();}state.history=[];state.future=[];state.messages=[];state.chat=false;state.carousel=0;state.expanded='';reloadOnboarding();navigate('Home',null,false);break;}
 case 'workspace':openMenu('workspace',el);break;
 case 'account':openMenu('account',el);break;
 case 'quick-new':openMenu('quick',el);break;
 case 'page-menu':case 'detail-menu':openMenu('page',el,state.detail);break;
 case 'row-menu':openMenu('row',el,id);break;
 case 'filter':openMenu('filter',el);break;
 case 'choose-filter':state.filter=el.dataset.filter;state.menu=null;render();break;
 case 'clear-filter':state.filter='All';render();break;
 case 'sort':state.sort=!state.sort;render();toast(state.sort?'Sorted in reverse order':'Default order');break;
 case 'close-menu':state.menu=null;render();break;
 case 'close-modal':state.modal=null;render();break;
 case 'workspace-settings':state.page='Settings';state.settingsTab='General';state.menu=null;render();break;
 case 'customize-speqq':state.menu=null;state.modal=null;openCustomization();break;
 case 'profile':navigate('Settings');state.settingsTab='Profile';render();break;
 case 'new':create();break;
 case 'create-workspace':state.modal={type:'workspace',title:'Create workspace'};state.menu=null;render();break;
 case 'open-item':if(state.page==='Goals'){state.expanded=state.expanded===id?null:id;render();}else if(state.page!=='Trash'){navigate(state.page,id);}break;
 case 'today':{const i=Number(el.dataset.index);if(db.kind==='student'){if(i===0)navigate('Goals');else if(i===1||i===3)navigate('Calendar');else navigate('Library');break;}if(i===0){navigate('Specs','spec-0');}else if(i===1||i===2){navigate('Calendar',i===1?'event-1':'event-3');}else if(i===4){navigate('Inbox','inbox-1');}else if(i===5){navigate('Inbox','inbox-3');}else if(i===7){navigate('Connectors','connector-8');}else navigate('Specs','spec-0');break;}
 case 'dismiss-today':el.closest('.today-card').classList.add('dismissed');toast('Marked as done');break;
 case 'carousel-prev':state.carousel=Math.max(0,state.carousel-3);render();break;
 case 'carousel-next':state.carousel=state.carousel+3>=homeCards().length?0:state.carousel+3;render();break;
 case 'open-calendar':navigate('Calendar');break;
 case 'month-prev':case 'month-next':state.month+=a==='month-prev'?-1:1;if(state.month<0){state.month=11;state.year--;}if(state.month>11){state.month=0;state.year++;}render();break;
 case 'toggle-skill':db.skills.find(s=>s.id===id).on=!db.skills.find(s=>s.id===id).on;save();render();break;
 case 'toggle-current-skill':r.on=!r.on;save();render();break;
 case 'toggle-agent':r.on=!r.on;r.status=r.on?'Enabled':'Off';save();render();break;
 case 'run-agent':r.status='Running';save();render();toast('Agent started');setTimeout(()=>{r.status='Ran just now';save();if(state.detail===r.id)render();},1800);break;
 case 'toggle-connector':r.connected=!r.connected;save();render();toast(r.connected?'Connected to workspace':'Disconnected');break;
 case 'sync-connector':toast('Sync complete');break;
 case 'toggle-read':r.unread=!r.unread;save();render();break;
 case 'read-all':db.inbox.forEach(i=>i.unread=false);save();state.menu=null;state.modal=null;render();toast('All messages marked as read');break;
 case 'menu-read':{const item=db.inbox.find(i=>i.id===state.menu.id);if(item)item.unread=false;save();state.menu=null;render();break;}
 case 'delete-current':deleteItem(state.detail);break;
 case 'delete-menu':deleteItem(state.menu.id||state.detail);break;
 case 'restore':{const item=db.trash.find(i=>i.id===id);db[item.key].push(item);db.trash=db.trash.filter(i=>i.id!==id);save();render();toast('Restored');break;}
 case 'rename':state.modal={type:'rename',title:'Rename',id:state.menu.id||state.detail,value:db[dataKey()]?.find(i=>i.id===(state.menu.id||state.detail))?.title};state.menu=null;render();break;
 case 'favorite':r.favorite=!r.favorite;save();el.classList.toggle('favorited',r.favorite);toast(r.favorite?'Added to favorites':'Removed from favorites');break;
 case 'spec-tab':state.specTab=el.dataset.tab;render();break;
 case 'add-tab':state.modal={type:'add-tab',title:'Add tab'};render();break;
 case 'add-tag':state.modal={type:'add-tag',title:'Add tag'};render();break;
 case 'hide-details':document.querySelector('.spec-layout').classList.toggle('details-hidden');break;
 case 'show-details':document.querySelector('.spec-layout').classList.toggle('show-details');document.querySelector('.spec-layout').classList.remove('details-hidden');break;
 case 'share':state.modal={type:'share'};render();break;
 case 'copy-link':await navigator.clipboard?.writeText(location.origin+'/#Specs/'+state.detail);toast('Link copied');break;
 case 'copy-handle':await navigator.clipboard?.writeText(el.dataset.text);toast('Handle copied');break;
 case 'comment':ask('Show comments on '+r.title);break;
 case 'memory-period':state.memoryPeriod=el.dataset.period;render();break;
 case 'memory-person':state.memoryPerson=el.dataset.person;render();break;
 case 'related-spec':navigate('Specs','spec-0');break;
 case 'ask-item':ask('Tell me about '+db[dataKey()].find(i=>i.id===id).title);break;
 case 'ask-text':ask(el.dataset.text);break;
 case 'ask-current':ask('Tell me about '+r.title);break;
 case 'menu-ask':ask('Tell me about '+(db[dataKey()]?.find(i=>i.id===state.menu.id)?.title||state.page));state.menu=null;render();break;
 case 'open-chat':state.chat=true;state.modal=null;render();document.querySelector('#ask-input').focus();break;
 case 'close-chat':state.chat=false;state.messages=[];render();break;
 case 'minimize-chat':state.chat=false;render();break;
 case 'expand-chat':state.chatExpanded=!state.chatExpanded;render();break;
 case 'sources':state.sources=!state.sources;render();break;
 case 'like-answer':toast('Thanks for your feedback');break;
 case 'ask-options':openMenu('ask',el);break;
 case 'attach':openMenu('attach',el);break;
 case 'attach-spec':navigate('Specs');break;
 case 'attach-memory':navigate('Memory');break;
 case 'attach-connectors':navigate('Connectors');break;
 case 'recent-spec':navigate('Specs','spec-0');break;
 case 'save-profile':{const first=document.querySelector('#first-name').value.trim(),last=document.querySelector('#last-name').value.trim(),username=document.querySelector('#username');if(!first||!last||!username.checkValidity()){toast('Enter a name and valid username');username.reportValidity();break;}db.profile={first,last,username:username.value,role:document.querySelector('#role').value};save();render();toast('Profile saved');break;}
 case 'save-workspace':db.workspace=document.querySelector('#workspace-name').value.trim()||'Umami';save();render();toast('Workspace saved');break;
 case 'change-picture':{const input=document.createElement('input');input.type='file';input.accept='image/*';input.onchange=()=>toast('Picture selected');input.click();break;}
 case 'settings-team':navigate('Team');break;
 case 'retry-log':r.status='Running';save();render();setTimeout(()=>{r.status='Completed';save();render();},1000);break;
 case 'approve':toast('Approved');r.type='Approved';save();render();break;
 }
});

app.addEventListener('input',e=>{
 if(e.target.id==='list-search'){
  const pos=e.target.selectionStart;state.query=e.target.value;const scroll=document.querySelector('.main-scroll').scrollTop;render();const input=document.querySelector('#list-search');input.focus();input.setSelectionRange(pos,pos);document.querySelector('.main-scroll').scrollTop=scroll;
 }
 if(e.target.id==='command-search'){const q=e.target.value.toLowerCase();document.querySelectorAll('[data-command]').forEach(el=>el.hidden=!el.dataset.command.includes(q));}
 if(e.target.dataset.editor==='spec'){const r=current();r.content??={};r.content[state.specTab]=sanitizeDocument(e.target.innerHTML);save();}
 if(e.target.dataset.editor==='title'){current().title=e.target.textContent;save();}
 if(e.target.dataset.input==='agent-instructions'){current().instructions=e.target.value;save();}
});
app.addEventListener('change',e=>{
 const kind=e.target.dataset.change,r=current();
 if(kind==='status'){r.status=e.target.value;save();toast('Status updated');}
 if(kind==='version'){r.version=e.target.value;save();toast('Version selected');}
 if(kind==='role'){r.role=e.target.value;save();}
 if(kind==='agent-trigger'){r.trigger=e.target.value;save();}
 if(kind==='connector-role'){db.profile.role=e.target.value;save();render();}
 if(kind==='connector-filter'){state.filter=e.target.value==='Connectors'?'All':e.target.value;render();}
 if(kind==='event-filter'){state.filter=e.target.value;render();}
 if(kind==='quarter'){state.query=e.target.value==='Q3 2026'?'__none__':'';render();}
 if(kind==='skill-filter'){state.filter='All';toast(e.target.value);}
 if(kind==='team-filter'){if(e.target.value==='Teams'){state.query='';document.querySelector('.rows').innerHTML=['Product','Web platform','Mobile','Design','Support','Sales'].map(t=>`<div class="panel">${icon('Team')} ${t}</div>`).join('');}}
 if(e.target.dataset.preference){db[e.target.dataset.preference]=e.target.checked;save();}
});
app.addEventListener('submit',e=>{
 e.preventDefault();
 if(e.target.id==='ask-form'){ask(new FormData(e.target).get('question'));return;}
 if(e.target.id!=='edit-form')return;
 const form=new FormData(e.target),title=String(form.get('title')).trim(),description=String(form.get('description')||'').trim();if(!title)return;
 const type=state.modal.type;
 if(type==='rename'){db[dataKey()].find(i=>i.id===state.modal.id).title=title;save();state.modal=null;render();return;}
 if(type==='add-tab'){const r=current();r.tabs??=[];r.tabs.push(title);state.specTab=title;save();state.modal=null;render();return;}
 if(type==='add-tag'){const r=current();r.tags??=[];r.tags.push(title);save();state.modal=null;render();return;}
 if(type==='workspace'){db.workspace=title;save();state.modal=null;render();return;}
 const id='local-'+Date.now();let item;
 switch(state.page){
 case 'Specs':item={id,title,description,status:'Draft',version:'v1.0',date:'Just now'};break;
 case 'Goals':item={id,title,source:'Specs',team:'Product',progress:0,status:'At risk',date:'Dec 31',people:'SR',metric:'Manual',value:'0%',summary:description,actions:['Define the next step for this goal.']};break;
 case 'Memory':item={id,title,description,handle:title.toLowerCase().replace(/[^a-z0-9]+/g,'-'),people:'SR',time:'Just now'};break;
 case 'Agents':item={id,title,description,trigger:'Weekdays 9 AM',status:'Not run yet',on:true};break;
 case 'Skills':item={id,title,author:'Umami',on:true};break;
 case 'Team':item={id,title:title.split('@')[0],description:title,initials:title.slice(0,2).toUpperCase(),tag:'',role:'Invited'};break;
 case 'Calendar':item={id,title,description,day:Number(String(form.get('date')).slice(-2)),type:form.get('eventType')};break;
 }
 if(item){db[dataKey()].push(item);save();state.modal=null;if(['Specs','Memory','Agents'].includes(state.page))navigate(state.page,id);else render();toast(type==='invite'?'Invitation saved locally':'Created');}
});
app.addEventListener('keydown',e=>{const el=e.target.closest('[data-action]');if((e.key==='Enter'||e.key===' ')&&el&&el.tagName!=='BUTTON'&&!e.target.isContentEditable){e.preventDefault();el.click();}});
let gTime=0;
document.addEventListener('keydown',e=>{
 if(['Onboarding','Study'].includes(location.hash.slice(1).split('/')[0]))return;
 const typing=/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable;
 if(e.key==='Escape'){if(state.modal){state.modal=null;render();}else if(state.menu){state.menu=null;render();}else if(state.chat){state.chat=false;render();}return;}
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();state.modal={type:'commands'};render();return;}
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='b'){e.preventDefault();state.sidebar=!state.sidebar;render();return;}
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='j'){e.preventDefault();state.chat=true;render();document.querySelector('#ask-input')?.focus();return;}
 if(state.modal?.type==='commands'&&['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();const all=[...document.querySelectorAll('.command-option:not([hidden])')],i=all.indexOf(document.activeElement);all[(i+(e.key==='ArrowDown'?1:-1)+all.length)%all.length]?.focus();return;}
 if(state.modal&&e.key==='Tab'){const all=[...document.querySelectorAll('[role="dialog"] button,[role="dialog"] input,[role="dialog"] select,[role="dialog"] textarea')].filter(el=>!el.hidden),first=all[0],last=all.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
 if(typing)return;
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='n'){e.preventDefault();navigate('Specs');create();return;}
 if(e.key.toLowerCase()==='g'){gTime=Date.now();return;}
 if(Date.now()-gTime<1200&&shortcuts[e.key.toLowerCase()]){navigate(shortcuts[e.key.toLowerCase()]);gTime=0;}
});
window.addEventListener('hashchange',()=>{const [p,id]=location.hash.slice(1).split('/');if(['Onboarding','Study'].includes(p)){render();return;}if(navGroups.some(g=>g[1].includes(p)))navigate(p,id||null);});
const [initialPage,initialId]=location.hash.slice(1).split('/');
if(navGroups.some(g=>g[1].includes(initialPage))){state.page=initialPage;state.detail=initialId||null;}
render();
