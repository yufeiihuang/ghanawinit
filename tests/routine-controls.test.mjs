import test from 'node:test';
import assert from 'node:assert/strict';
import { organizationPlan,applyOrganization,undoOrganization } from '../src/routine-controls.js';
const files=[{id:'1',name:'Notes',folder:''},{id:'2',name:'Locked',folder:'',keepInPlace:true},{id:'3',name:'Protected folder',folder:'Private'},{id:'4',name:'Other',folder:'Other'}];
const library={files,folders:['Private','Other'],lockedFolders:['Private']};
const access={permission:'organize',files:['1','2','3'],folders:[],destination:'Sorted'};
test('organizing requires explicit access and skips protected files and folders',()=>{
 assert.deepEqual(organizationPlan(files,library,{}),[]);
 assert.deepEqual(organizationPlan(files,library,{...access,permission:'read'}),[]);
 assert.deepEqual(organizationPlan(files,library,access).map(p=>p.id),['1']);
 assert.deepEqual(organizationPlan(files,library,{...access,files:[],folders:['Other']}).map(p=>p.id),['4']);
});
test('apply rechecks permissions and locks after preview',()=>{
 const plan=organizationPlan(files,library,access);
 assert.equal(applyOrganization(files,library,{...access,files:[]},plan).applied.length,0);
 assert.equal(applyOrganization(files.map(f=>({...f,keepInPlace:true})),library,access,plan).applied.length,0);
 assert.equal(applyOrganization(files,library,access,[{...plan[0],to:'Unexpected'}]).applied.length,0);
});
test('undo restores moved folders and preserves subsequent content edits and manual moves',()=>{
 const {saved,applied,createdFolders}=applyOrganization(files,library,access,organizationPlan(files,library,access));
 assert.equal(saved.files.find(f=>f.id==='1').folder,'Sorted');
 const edited={...saved,files:saved.files.map(f=>f.id==='1'?{...f,content:'Edited later'}:f)};
 const undone=undoOrganization(edited,applied).files.find(f=>f.id==='1');
 assert.equal(undone.folder,'');assert.equal(undone.content,'Edited later');
 const movedAgain={...edited,files:edited.files.map(f=>({...f,folder:'Manual'}))};
 assert.equal(undoOrganization(movedAgain,applied).files.find(f=>f.id==='1').folder,'Manual');
 assert.equal(files[0].folder,'');
 assert(!undoOrganization(saved,applied,createdFolders).folders.includes('Sorted'));
 assert.deepEqual(organizationPlan(files,library,{...access,destination:'Private'}),[]);
});
