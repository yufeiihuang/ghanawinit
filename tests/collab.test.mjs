import test from 'node:test';
import assert from 'node:assert/strict';
import { collabSeed, collabSections, migrateCollab, isNyuEmail, requestSchoolCode, confirmSchoolCode } from '../src/collab.js';
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

test('NYU email verification is a gated demo with invalid-code and expiry handling',()=>{
 const state=collabSeed(true);
 assert.equal(isNyuEmail('student@gmail.com'),false);
 assert.equal(isNyuEmail('person@nyu.edu.evil.example'),false);
 assert.equal(requestSchoolCode(state,'person@example.com',1000),false);
 assert.equal(confirmSchoolCode(state,'123456',1001),false);
 assert.equal(requestSchoolCode(state,'  Yufei@NYU.EDU ',1000),true);
 assert.equal(state.schoolVerification.email,'yufei@nyu.edu');
 assert.equal(confirmSchoolCode(state,'999999',2000),false);
 assert.equal(state.schoolVerification.status,'pending');
 assert.equal(confirmSchoolCode(state,'123456',700000),false);
 requestSchoolCode(state,'yufei@nyu.edu',800000);
 assert.equal(confirmSchoolCode(state,'123456',800001),true);
 assert.equal(state.schoolVerification.status,'verified');
 assert.equal(state.schoolEmail,'yufei@nyu.edu');
});

test('groups separate memberships and invitations and exclude private groups from discovery',()=>{
 const state=collabSeed(false),sections=collabSections(state);
 assert.ok(sections.yours.every(g=>g.joined));
 assert.ok(sections.discover.every(g=>!g.joined&&g.visibility==='public'));
 assert.equal(sections.invitations.length,1);
 const invitation=sections.invitations[0],group=state.groups.find(g=>g.id===invitation.groupId);
 assert.equal(group.visibility,'private');assert.ok(!sections.discover.includes(group));
 invitation.status='accepted';group.joined=true;
 assert.ok(collabSections(state).yours.includes(group));assert.equal(collabSections(state).invitations.length,0);
 const count=state.groups.length;migrateCollab(state,false);assert.equal(state.groups.length,count);
});
