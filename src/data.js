export const navGroups = [
  ['', ['Home', 'Inbox', 'Calendar']], ['Discover', ['Marketplace']], ['Work', ['Goals', 'Specs', 'Library', 'Memory']],
  ['Automation', ['Agents', 'Skills']], ['Workspace', ['Connectors', 'Collab']],
  ['System', ['Settings', 'Commands']]
];
export const shortcuts = {h:'Home',i:'Inbox',o:'Goals',s:'Specs',m:'Memory',a:'Agents',k:'Skills',c:'Connectors',t:'Collab'};
export const today = [
  ['GitHub', 'GitHub · umami', 'Review #2431 before v4.13 ships', 'Blocks release', '20m', 'yellow'],
  ['Google Calendar','Google Calendar · 4:00 PM','Sprint 25 planning with the team','Meeting','Today','blue'],
  ['Canvas','Canvas · CS 194 Capstone','Milestone 2 demo is due Friday','Due Fri','1d','yellow'],
  ['Specs','Spec · Session management · v1.3','Marcus requested changes on Session management','Changes requested','2h','red'],
  ['Linear','Linear · Web platform','Fix MOB-412: mobile app ignores token rotation','Due today','3h','yellow'],
  ['Discord','Discord · #umami-team','Dana asked who’s taking the dashboard bug','Waiting on you','40m','blue'],
  ['Specs','Spec · Workspace rate limits · v2.0','Priya approved Workspace rate limits v2.0','Approved','35m','green'],
  ['Figma','Figma · Onboarding flow','Marcus updated the onboarding designs','Updated','5h','purple']
];
export const inbox = [
  ['Datadog','5xx error rate above 2% on /api/send','Alert','12m'],
  ['Linear','MOB-412 Refresh token not rotated on iOS','Assigned','1h'],
  ['GitHub','#2421 Add rotateRefreshToken to mobile client','Review','5h'],
  ['Slack','Can you confirm the refresh window is 5 min?','Mention','6h'],
  ['Specs','Wants to add a note to Acme in Attio','Approval','20m'],
  ['Specs','Approved Workspace rate limits v2.0','Approved','35m'],
  ['Specs','Requested changes on Session management v1.3','Changes','2h'],
  ['Notion','Replied on Workspace rate limits','Comment','1d'],
  ['Specs','Session management may be out of date','Stale','2d'],
  ['Specs','Keep p95 dashboard load under 1s is off track','Goal','2d']
].map((r,i)=>({id:'inbox-'+i,source:r[0],title:r[1],type:r[2],time:r[3],unread:true}));
export const specs = ['Navigation — get back to where you were','History persistence','Keyboard navigation','Spec search dialogue','Shared components — the design kit','Design kit buttons','Design kit tables','Spec table','Recent specs list updates','Workspace navigation'].map((title,i)=>({id:'spec-'+i,title,version:i===0?'v3.1':'v1.0',status:'Draft',date:i<9?'Jul 14':'Jul 13',private:i===1,tab:'Overview'}));
export const goals = [
  {id:'goal-0',source:'PostHog',title:'Grow weekly active users to 15k',team:'Product',progress:77,status:'At risk',date:'Dec 31',people:'SR ML',metric:'PostHog · WAU',value:'11.5k of 15.0k',summary:'WAU is up 6% month over month but needs about 9% to land by Dec 31. Most new users come from the free plan; activation drops after the first dashboard.',actions:['Fix the empty first dashboard: 38% of new users never add a site.','Ship the shareable-report link from WEB-1190; shared reports drove 22% of last month’s signups.','Re-engage 1,900 users who signed up in Sep and haven’t returned.']},
  {id:'goal-1',source:'Stripe',title:'Reach $60k MRR',team:'Product',progress:87,status:'At risk',date:'Dec 31',people:'SR',metric:'Stripe · MRR',value:'$52.2k of $60k',summary:'Monthly recurring revenue is growing. Annual plans and the billing v2 rollout are the next opportunities.',actions:['Finish annual plans in Billing v2.','Review the enterprise pipeline with Sales.']},
  {id:'goal-2',source:'Datadog',title:'Keep p95 dashboard load under 1s',team:'Web platform',progress:81,status:'Off track',date:'Nov 30',people:'PR DO',metric:'Datadog · p95',value:'1.23s of 1s',summary:'Dashboard latency is above target. The slowest requests are on the first dashboard load.',actions:['Investigate slow queries on the dashboard.','Review caching with Priya and Dana.']},
  {id:'goal-3',source:'Linear',title:'Close 90% of P1 bugs within 7 days',team:'Mobile',progress:100,status:'Hit',date:'Ongoing',people:'DO',metric:'Linear · P1 bugs',value:'90% of 90%',summary:'The mobile team is meeting its response-time target.',actions:['Keep monitoring new P1 bugs.']}
];
export const memories = [
  {id:'memory-0',title:'Billing v2',handle:'billing-v2',description:'Rebuilding billing on Stripe: annual plans, prorated refunds, and reliable webhooks.',people:'JP SR PR DO',time:'2:14 PM'},
  {id:'memory-1',title:'TV app',handle:'tv-app',description:'The living-room app: remote-friendly navigation and playback for smart TVs.',people:'ML',time:'9:30 AM',private:true},
  {id:'memory-2',title:'Session refresh',handle:'sessions',description:'Fixing sign-outs when several tabs refresh the session at once.',people:'PR',time:'Yesterday'},
  {id:'memory-3',title:'Umami',handle:'umami',description:'General work on Umami that isn’t tied to a project.',people:'SR',time:'Oct 16'}
];
export const agents = [
  {id:'agent-0',title:'Morning research',trigger:'Weekdays 9 AM',description:'Every weekday at 9:00 AM',status:'Ran 3h ago',on:true},
  {id:'agent-1',title:'Bug triage',trigger:'Linear issue → bug',description:'When a Linear issue is labeled bug',status:'Running',on:true},
  {id:'agent-2',title:'Deal brief',trigger:'Attio deal → Proposal',description:'When an Attio deal moves to Proposal',status:'Approve',on:true},
  {id:'agent-3',title:'Release notes',trigger:'Release is published on GitHub',description:'When a release is published on GitHub',status:'Ran 2d ago',on:true},
  {id:'agent-4',title:'Weekly digest',trigger:'Fri 4 PM',description:'Every Friday at 4:00 PM',status:'Off',on:false}
];
export const skills = ['search-knowledge','project-memory','write-spec','frontend-design','webapp-testing','postgres-migrations'].map((title,i)=>({id:'skill-'+i,title,author:i<3?'Speqq':i<5?'anthropics':'umami-software',on:true,scripts:i>3}));
export const connectors = [
  ['Google Drive','Docs, sheets, and slides from your Drive.'],['Canvas','Courses, assignments, and due dates from Canvas.'],['Discord','Messages from the servers and channels you pick.'],['Anthropic','Run agents on Claude, billed to your Anthropic account.'],['GitHub','Code, issues, pull requests and commits from your GitHub repositories.'],['Linear','Issues from your Linear teams and projects.'],['Specs','The specs written in this workspace.'],['Slack','Messages and threads from your channels.'],['Figma','Pages and comments from the Figma files you add by link.'],['Google Calendar','Private events from your primary Google Calendar.'],['Notion','Pages and databases from your workspace.'],['Obsidian','Notes from your Obsidian vault.'],['Zotero','Papers, citations, and notes from your library.'],['Todoist','Tasks and projects from Todoist.'],['Claude Code','Give Claude Code your product’s knowledge, memory, and skills.'],['Claude','Use Speqq from Claude on desktop and the web.'],['Codex','Give Codex your product’s knowledge, memory, and skills.'],['Cursor','Give Cursor your product’s knowledge, memory, and skills.'],['Datadog','Monitors, incidents, dashboards, notebooks, SLOs and error issues.'],['Gmail','Private messages from your connected Gmail mailbox.'],['Granola','Meeting notes and transcripts from your Granola account.'],['Jira','Issues and project context from Jira Cloud.'],['Mintlify','Public documentation.'],['Quizlet','Study sets, flashcards, and practice tests from Quizlet.'],['Notability','Handwritten notes, PDFs, and audio recordings from Notability.'],['GoodNotes 6','Notebooks, annotated PDFs, and handwriting from GoodNotes 6.'],['Brightspace','Courses, assignments, grades, and announcements from Brightspace.'],['Google Classroom','Classes, coursework, and due dates from Google Classroom.']
].map((r,i)=>({id:'connector-'+i,title:r[0],description:r[1],connected:i<11}));
export const team = [
  ['AS','Ana Silva','Mobile Engineer · Mobile','Mobile app','Invited'],['DO','Dana Okafor','Software Engineer · Web platform','Mobile','Member'],['LP','Lena Park','Support Lead · Support','Customer questions','Invited'],['ML','Marcus Lee','Product Designer · Design','Design system','Member'],['PR','Priya Raman','Staff Engineer · Web platform','Auth','Member'],['SR','Sam Rivera','Head of Product · Product','Roadmap','Admin'],['TG','Theo Grant','Account Executive · Sales','Enterprise deals','Invite']
].map((r,i)=>({id:'person-'+i,initials:r[0],title:r[1],description:r[2],tag:r[3],role:r[4]}));
export const logs = [
  ['Commits sync','umami-software/umami','Running','—','Oct 6 12:10'],['Linear issues','Web platform','Failed','12.4s','Oct 6 11:58'],['Source removed','sindresorhus/is','Completed','8.1s','Oct 6 08:30'],['Workspace deletion','Deleted workspace','Completed','32.6s','Oct 6 08:07'],['Specs check','Specs','Completed','4.2s','Oct 6 07:08'],['Product card','Wiki','Completed','9.3s','Oct 6 07:08'],['Wiki update','umami-software/umami · master','Completed','5m 41s','Oct 6 07:02'],['Code explanations','Wiki','Completed','9.2s','Oct 6 07:02'],['Linear issues','API','Completed','54.3s','Oct 6 07:02'],['Commits sync','umami-software/umami','Completed','1m 36s','Oct 6 07:02'],['Pull requests','umami-software/umami','Completed','4m 33s','Oct 6 07:02'],['Notion pages','Product specs','Completed','18.7s','Oct 6 06:40']
].map((r,i)=>({id:'log-'+i,title:r[0],description:r[1],status:r[2],duration:r[3],date:r[4]}));
export const events = [
  [10,'10:00 Daily standup','Meeting','Discord · 10:00 AM · #umami-team'],[11,'4:00 Sprint 25 planning','Meeting','Google Calendar · 4:00 PM · whole team'],[12,'v4.13 release','Release','GitHub · 11 pull requests · #2431 still in review'],[13,'Milestone 2 demo due','Milestone','Canvas · CS 194 Capstone · login flow + spec'],[13,'Session management spec review due','Spec','Spec · v1.3 · Marcus requested changes'],[16,'Workspace rate limits build starts','Spec','Spec · v2.0 approved'],[18,'11:00 Onboarding design review','Meeting','Figma · 11:00 AM · Marcus, Sam'],[20,'MOB-412 fix ships to TestFlight','Release','Linear · Mobile · Urgent'],[24,'Code freeze for final demo','Goal','Goal · Ship v5.0 for demo day'],[25,'Mobile app 3.0 beta','Launch','Linear · Mobile 3.0 project · 40 beta testers'],[30,'Keep p95 dashboard load under 1s','Goal','Goal · 60% · Priya, Dana'],[34,'Milestone 3 report due','Milestone','Canvas · CS 194 Capstone · architecture write-up']
].map((r,i)=>({id:'event-'+i,day:r[0],title:r[1],type:r[2],description:r[3]}));
// Available connectors are grouped into these sections, in this order.
export const connectorCategories = [
  ['Learning', ['Canvas','Quizlet','Notability','GoodNotes 6','Brightspace','Google Classroom','Zotero']],
  ['Engineering', ['GitHub','Linear','Jira','Datadog','Claude Code','Codex','Cursor','Anthropic','Mintlify']],
  ['Work & productivity', ['Google Drive','Google Calendar','Gmail','Slack','Discord','Figma','Notion','Obsidian','Todoist','Granola','Claude','Specs']]
];
export function connectorCategory(title) { return (connectorCategories.find(([,titles])=>titles.includes(title))||connectorCategories[2])[0]; }
// The profile role picks which unconnected connectors are suggested first.
export const roles = {
  Student: { notA:'Not a student?', picks:['Quizlet','Google Classroom','Notability','GoodNotes 6','Brightspace','Canvas','Zotero','Todoist','Obsidian'] },
  Developer: { notA:'Not a developer?', picks:['Claude Code','Cursor','Codex','Datadog','Jira','Mintlify','GitHub','Linear','Gmail'] },
  'Product & design': { notA:'Not in product or design?', picks:['Granola','Jira','Figma','Todoist','Gmail','Claude','Mintlify','Notion'] },
  Researcher: { notA:'Not a researcher?', picks:['Zotero','Obsidian','Notability','Granola','Claude','Gmail','Google Drive','Notion'] }
};
export const defaultRole = 'Developer';
export function suggestedConnectors(connectors, role, limit=4) {
  const picks=(roles[role]||roles[defaultRole]).picks;
  return picks.map(t=>connectors.find(c=>c.title===t&&!c.connected)).filter(Boolean).slice(0,limit);
}
// Marketplace: public items anyone can browse and add to their workspace.
const marketItems = {
  Memory: [
    ['Gen Chem 1','Reactions, stoichiometry, and equilibrium for first-year chemistry.','UC Berkeley','3.1k'],
    ['Design Thinking','Empathize, define, ideate, prototype, and test \u2014 with examples.','IDEO U','2.4k'],
    ['U.S. History 101','Key eras, figures, and turning points from 1776 to today.','Khan Academy','1.8k'],
    ['Startup Metrics','CAC, LTV, burn, and the numbers investors ask about.','Y Combinator','4.6k'],
    ['Spanish B1','Grammar, common verbs, and conversation phrases.','Duolingo','5.2k'],
    ['Human Anatomy','Systems, structures, and terminology for pre-med.','Osmosis','1.2k']
  ],
  Skills: [
    ['Cite in APA','Format references and in-text citations in APA 7.','Speqq','980'],
    ['Summarize PDF','Turn a long paper into a one-page brief.','Speqq','6.7k'],
    ['Flashcard maker','Generate spaced-repetition cards from any note.','Quizlet','3.3k'],
    ['Code reviewer','Flag bugs and suggest fixes on a diff.','Speqq','8.1k'],
    ['Meeting notes','Clean a transcript into decisions and action items.','Granola','2.9k'],
    ['Translate','Translate text between 30+ languages.','DeepL','4.0k']
  ],
  Templates: [
    ['Weekly Planner','Plan your week with priorities and time blocks.','Notion','12k'],
    ['Lab Report','Hypothesis, method, results, and discussion.','Overleaf','1.1k'],
    ['Product Spec','Problem, solution, requirements, and rollout plan.','Speqq','3.5k'],
    ['Course Syllabus','Schedule, readings, grading, and policies.','Google Classroom','900'],
    ['Reading List','Track books with notes, ratings, and status.','Notion','2.2k'],
    ['Sprint Board','Backlog, in progress, review, and done.','Linear','5.8k']
  ],
  Agents: [
    ['Study Buddy','Quizzes you on your notes before an exam.','Speqq','2.1k'],
    ['Release Notes','Drafts a changelog from merged pull requests.','GitHub','1.7k'],
    ['Inbox Triage','Sorts and labels new messages each morning.','Speqq','3.9k'],
    ['Citation Finder','Finds sources to back up a claim.','Zotero','760'],
    ['Standup Bot','Collects updates and posts a daily summary.','Slack','4.4k'],
    ['Deadline Watcher','Reminds you before assignments are due.','Brightspace','1.3k']
  ]
};
export const marketplace = Object.entries(marketItems).map(([category,items])=>({
  category,
  items: items.map((r,i)=>({id:'market-'+category.toLowerCase()+'-'+i,title:r[0],description:r[1],author:r[2],uses:r[3],category}))
}));
export function initialData() { return structuredClone({inbox,specs,goals,memories,agents,skills,connectors,team,logs,events,trash:[],marketAdded:[],profile:{first:'Sam',last:'Rivera',username:'sam',role:defaultRole},workspace:'Umami'}); }
export function filterItems(items,query='') { const q=query.trim().toLowerCase(); return items.filter(item=>[item.title,item.description,item.author,item.team,item.type].filter(Boolean).join(' ').toLowerCase().includes(q)); }
export function calendarCells(year,month) { const start=new Date(year,month,1).getDay();const count=new Date(year,month+1,0).getDate();return Array.from({length:Math.ceil((start+count)/7)*7},(_,i)=>({day:new Date(year,month,i-start+1).getDate(),current:i>=start&&i<start+count,index:i-start+1})); }
