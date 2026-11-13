import test from 'node:test';
import assert from 'node:assert/strict';
import { collabSeed } from '../src/collab.js';
test('student Collab groups reference known people and include school/course groups',()=>{
 const seed=collabSeed(true),ids=new Set(seed.people.map(p=>p.id));
 assert.ok(seed.groups.some(g=>g.type==='School'));
 assert.ok(seed.groups.some(g=>g.type==='Course'&&g.term));
 assert.ok(seed.groups.every(g=>g.people.every(id=>ids.has(id))));
 const other=collabSeed(true);seed.groups[0].joined=true;
 assert.equal(other.groups[0].joined,false);
 assert.equal(other.schoolEmail,'');assert.deepEqual(other.invites,[]);
});
test('non-student Collab seeds project/research groups without school affiliation',()=>{
 const seed=collabSeed(false);
 assert.ok(seed.groups.some(g=>g.type==='Project'));
 assert.ok(seed.groups.some(g=>g.type==='Research'));
 assert.ok(seed.groups.every(g=>!g.school));
});
