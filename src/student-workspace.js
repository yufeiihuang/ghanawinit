import { initialData } from './data.js';
export const studentToday = [
  ['Canvas','Canvas · Cell Biology','Review membrane transport before Thursday','Exam prep','25m','yellow'],
  ['Google Calendar','Study group · 4:00 PM','Work through chemistry practice problems','Study group','Today','blue'],
  ['Library','Library · General Chemistry','Revisit electrochemical gradients','Review notes','15m','green'],
  ['Canvas','Canvas · Calculus I','Finish problem set 6','Due Friday','2d','yellow']
];
export function studentWorkspace() {
  const db = initialData();
  db.workspace = 'Maya’s study space';
  db.kind = 'student';
  db.profile = {first:'Maya',last:'Chen',username:'maya',role:'Student'};
  db.inbox = [
    {id:'student-inbox-1',source:'Canvas',title:'Cell Biology midterm review is ready',type:'Review',time:'20m',unread:true},
    {id:'student-inbox-2',source:'Google Calendar',title:'Chemistry study group at 4 PM',type:'Reminder',time:'1h',unread:true},
    {id:'student-inbox-3',source:'Library',title:'Your chemistry notes are ready to revisit',type:'Review',time:'2h',unread:false}
  ];
  db.goals = [
    {id:'student-goal-1',title:'Feel ready for the Cell Biology midterm',source:'Canvas',team:'Cell Biology',progress:60,status:'At risk',date:'Nov 19',people:'MC',metric:'Review sessions',value:'3 of 5',summary:'Review membrane transport, cell signaling, and ATP synthesis before the midterm.',actions:['Review lecture 6 notes','Work through 15 practice questions','Explain ATP synthesis without looking at notes']},
    {id:'student-goal-2',title:'Connect chemistry concepts to biology',source:'Library',team:'Across courses',progress:40,status:'Off track',date:'Dec 1',people:'MC',metric:'Connections saved',value:'2 of 5',summary:'Build a stronger understanding by connecting ideas across your courses.',actions:['Compare electrochemical gradients and proton transport','Review the chemistry behind ATP synthesis']}
  ];
  db.specs = [{id:'student-doc-1',title:'Cell Biology midterm study guide',description:'Topics and practice questions for the midterm',status:'Draft',version:'v1.0',date:'Nov 12',content:{Overview:'<h1>Cell Biology midterm study guide</h1><h2>Membrane transport</h2><p>Compare diffusion, facilitated diffusion, and active transport.</p><h2>Energy and ATP</h2><p>Explain how a proton gradient powers ATP synthase.</p>'}}];
  db.memories = [{id:'student-memory-1',title:'Connections across courses',description:'Chemistry principles that explain biological processes',handle:'course-connections',people:'MC',time:'Today'}];
  db.agents = [
    {id:'student-agent-1',title:'Weekly course recap',trigger:'Fri 4 PM',description:'Summarize this week’s notes and suggest concepts to revisit',status:'Ready',on:true},
    {id:'student-agent-2',title:'Midterm practice questions',trigger:'Weekdays 6 PM',description:'Create practice questions from Cell Biology notes',status:'Not run yet',on:true},
    {id:'student-agent-3',title:'Connect my courses',trigger:'New notes added',description:'Suggest links between chemistry and biology',status:'Not run yet',on:true}
  ];
  db.agents.forEach(agent=>{agent.instructions=agent.description+'. Use the student’s course notes and cite the relevant material. Keep suggestions concise and practical.';});
  db.skills = ['Summarize lecture notes','Practice questions','Connect concepts','Plan a study session'].map((title,i)=>({id:`student-skill-${i}`,title,author:'Speqq',on:true}));
  const connected = new Set(['Canvas','Google Drive','Google Calendar','Notion']);
  db.connectors = db.connectors.map(c=>({...c,connected:connected.has(c.title)}));
  for (const [title,description] of [['Brightspace','Courses and assignments from Brightspace'],['mySchoolApp','Classes and school resources'],['Notability','Lecture notes and annotations'],['Goodnotes','Notebooks and handwritten notes']]) if (!db.connectors.some(c=>c.title===title)) db.connectors.push({id:`student-connector-${title}`,title,description,connected:false});
  db.team = [{id:'student-team-1',title:'Maya Chen',description:'Biology · Student',initials:'MC',tag:'Personal workspace',role:'Admin'}];
  db.events = [
    {id:'student-event-1',day:12,title:'Chemistry study group',type:'Meeting',description:'4:00 PM · Library room 204'},
    {id:'student-event-2',day:13,title:'Calculus problem set 6',type:'Milestone',description:'Submit before 11:59 PM'},
    {id:'student-event-3',day:19,title:'Cell Biology midterm',type:'Goal',description:'Membrane transport, signaling, and ATP synthesis'},
    {id:'student-event-4',day:20,title:'Weekly course review',type:'Meeting',description:'Revisit this week’s notes and save useful connections'}
  ];
  db.logs = []; db.trash = [];
  return db;
}
export function studentFiles() {
  return {folders:['Cell Biology','General Chemistry','Calculus I'],files:[
    {id:'student-file-1',name:'Membrane transport.md',folder:'Cell Biology',source:'Canvas',date:'Nov 12',size:420,content:'# Membrane transport\n\nPassive transport moves substances down a concentration gradient. Active transport requires energy to move substances against a gradient.\n\nReview: how does the sodium-potassium pump maintain membrane potential?'},
    {id:'student-file-2',name:'Electrochemical gradients.md',folder:'General Chemistry',source:'Notability',date:'Nov 11',size:360,content:'# Electrochemical gradients\n\nAn electrochemical gradient combines concentration and electrical potential differences.\n\nConnection: protons flowing through ATP synthase help convert stored energy into ATP.'},
    {id:'student-file-3',name:'Integration practice.md',folder:'Calculus I',source:'Upload',date:'Nov 10',size:250,content:'# Integration practice\n\nReview substitution, definite integrals, and the fundamental theorem of calculus.\n\nPractice: explain the relationship between area under a curve and accumulated change.'}
  ]};
}
export function seedStudentWorkspace(storage) {
  const key = 'speqq-umami-v1-student';
  if (!storage.getItem(key)) storage.setItem(key,JSON.stringify(studentWorkspace()));
  if (!storage.getItem('speqq-library-v1-student')) storage.setItem('speqq-library-v1-student',JSON.stringify(studentFiles()));
  if (!storage.getItem('speqq-student-onboarding-v1-student')) storage.setItem('speqq-student-onboarding-v1-student',JSON.stringify({role:'Student',major:'Biology',year:'Second year',goal:'Connect what I learn',courses:['Cell Biology','General Chemistry','Calculus I'],completed:true,step:0}));
}
