import test from 'node:test';
import assert from 'node:assert/strict';
import { studentWorkspace, studentFiles, seedStudentWorkspace } from '../src/student-workspace.js';
import { workspaceKey, activeWorkspace, ACTIVE_WORKSPACE_KEY } from '../src/workspace-storage.js';
test('seeding a student workspace preserves Umami and existing student edits', () => {
  const data = new Map([['speqq-umami-v1','original workspace'],['speqq-library-v1','original files'],['speqq-student-onboarding-v1','original setup']]);
  const storage = {getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};
  seedStudentWorkspace(storage);
  assert.equal(data.get('speqq-umami-v1'),'original workspace');
  assert.equal(data.get('speqq-library-v1'),'original files');
  assert.equal(data.get('speqq-student-onboarding-v1'),'original setup');
  assert.equal(JSON.parse(data.get('speqq-umami-v1-student')).profile.first,'Yufei');
  data.set('speqq-umami-v1-student','student changes'); seedStudentWorkspace(storage);
  assert.equal(data.get('speqq-umami-v1-student'),'student changes');
  assert.equal(workspaceKey('files',storage),'files-student');
  data.set(ACTIVE_WORKSPACE_KEY,'umami');
  assert.equal(workspaceKey('files',storage),'files');
  data.set(ACTIVE_WORKSPACE_KEY,'student');
  assert.equal(workspaceKey('files',storage),'files-student');
});
test('student seed contains independent course content and Library notes', () => {
  const a=studentWorkspace(),b=studentWorkspace();a.goals[0].title='edited';
  assert.notEqual(a.goals[0].title,b.goals[0].title);
  assert.ok(b.events.every(event=>!event.title.includes('release')));
  assert.equal(studentFiles().files.length,3);
  assert.ok(studentFiles().files.every(file=>file.content&&file.folder));
});

test('legacy sample name migrates to Yufei while keeping files and edits',()=>{
 const original=studentWorkspace();original.profile={first:'Maya',last:'Chen',username:'maya'};original.workspace='Maya’s study space';original.goals[0].title='My custom goal';
 const values=new Map([['speqq-umami-v1-student',JSON.stringify(original)],['speqq-library-v1-student','my library']]);
 const storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};
 seedStudentWorkspace(storage);const saved=JSON.parse(values.get('speqq-umami-v1-student'));
 assert.equal(saved.profile.first,'Yufei');assert.equal(saved.profile.last,'Huang');assert.equal(saved.workspace,'Yufei’s study space');
 assert.equal(saved.goals[0].title,'My custom goal');assert.equal(values.get('speqq-library-v1-student'),'my library');
});

test('new visitors default to the student demo while an explicit Umami choice persists',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
 assert.equal(activeWorkspace(storage),'student');seedStudentWorkspace(storage);
 assert.equal(JSON.parse(values.get('speqq-umami-v1-student')).workspace,'Yufei’s study space');
 assert.equal(JSON.parse(values.get('speqq-student-onboarding-v1-student')).completed,true);
 values.set(ACTIVE_WORKSPACE_KEY,'umami');assert.equal(activeWorkspace(storage),'umami');
});

test('shared starter demo includes the selected browser file locations, protection and school community',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
 seedStudentWorkspace(storage);
 const library=JSON.parse(values.get('speqq-library-v1-student'));
 assert.equal(library.files.find(f=>f.name==='Membrane transport.md').folder,'Calculus I');
 assert.equal(library.files.find(f=>f.name==='Electrochemical gradients.md').keepInPlace,true);
 assert.equal(library.files.find(f=>f.name==='Integration practice.md').folder,'Cell Biology');
 const collab=JSON.parse(values.get('speqq-collab-v1-student'));
 assert.equal(collab.schoolVerification.email,'yh5154@nyu.edu');
 assert.equal(collab.schoolVerification.demo,true);
 assert.equal(collab.groups.filter(g=>g.joined).length,2);
 collab.groups[0].joined=true;values.set('speqq-collab-v1-student',JSON.stringify(collab));
 seedStudentWorkspace(storage);assert.equal(JSON.parse(values.get('speqq-collab-v1-student')).groups[0].joined,true);
});

test('student Logs starts hidden and can be explicitly enabled without being hidden again',()=>{
 const fresh=studentWorkspace();assert(fresh.sidebar.hidden.includes('Logs'));
 delete fresh.studentSidebarDefaultsVersion;fresh.sidebar={favorites:['Library'],hidden:['Skills']};
 const values=new Map([['speqq-umami-v1-student',JSON.stringify(fresh)],['speqq-umami-v1','unchanged Umami']]);
 const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
 seedStudentWorkspace(storage);
 const migrated=JSON.parse(values.get('speqq-umami-v1-student'));
 assert.deepEqual(migrated.sidebar,{favorites:['Library'],hidden:['Skills','Logs']});
 migrated.sidebar.hidden=['Skills'];values.set('speqq-umami-v1-student',JSON.stringify(migrated));
 seedStudentWorkspace(storage);assert.deepEqual(JSON.parse(values.get('speqq-umami-v1-student')).sidebar.hidden,['Skills']);
 assert.equal(values.get('speqq-umami-v1'),'unchanged Umami');
});
