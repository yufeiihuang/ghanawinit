import test from 'node:test';
import assert from 'node:assert/strict';
import { initialData, filterItems, calendarCells, connectorCategories, connectorCategory, suggestedConnectors, roles } from '../src/data.js';

test('workspace seed is isolated from edits and has unique stable ids',()=>{
 const first=initialData();const next=initialData();
 first.specs[0].title='Edited';first.goals[0].actions.push('New action');
 assert.notEqual(first.specs[0].title,next.specs[0].title);
 assert.equal(next.goals[0].actions.length,3);
 const ids=Object.values(next).filter(Array.isArray).flat().map(x=>x.id);
 assert.equal(new Set(ids).size,ids.length);
});
test('search handles case, whitespace, titles and source descriptions',()=>{
 const db=initialData();
 assert.deepEqual(filterItems(db.specs,'  KEYBOARD ').map(x=>x.title),['Keyboard navigation']);
 assert.ok(filterItems(db.connectors,'pull requests').some(x=>x.title==='GitHub'));
 assert.equal(filterItems(db.inbox,'no such inbox message').length,0);
 assert.equal(filterItems(db.skills,'').length,6);
});
test('calendar aligns November 2026 and includes December spillover',()=>{
 const cells=calendarCells(2026,10);
 assert.equal(cells.length,35);
 assert.equal(cells[0].day,1);
 assert.equal(cells[10].day,11);
 assert.equal(cells.filter(x=>x.current).length,30);
 assert.equal(cells[33].index,34);
 assert.equal(cells[33].day,4);
 assert.equal(cells[33].current,false);
});
test('calendar handles leap years and leading days',()=>{
 const cells=calendarCells(2028,1);
 assert.equal(cells.filter(x=>x.current).length,29);
 assert.equal(cells.findIndex(x=>x.current),2);
 assert.equal(cells.length%7,0);
});
test('every connector belongs to exactly one of at most three categories',()=>{
 assert.ok(connectorCategories.length<=3);
 const listed=connectorCategories.flatMap(([,t])=>t);
 assert.equal(new Set(listed).size,listed.length);
 for(const c of initialData().connectors)assert.ok(listed.includes(c.title),c.title+' has no category');
 assert.equal(connectorCategory('Quizlet'),'Learning');
});
test('suggestions follow the profile role and skip connected connectors',()=>{
 const db=initialData();
 for(const role of Object.keys(roles)){
  const picks=suggestedConnectors(db.connectors,role);
  assert.equal(picks.length,4,role);
  assert.ok(picks.every(c=>!c.connected));
 }
 assert.deepEqual(suggestedConnectors(db.connectors,'Student').map(c=>c.title),['Quizlet','Google Classroom','Notability','GoodNotes 6']);
 db.connectors.find(c=>c.title==='Quizlet').connected=true;
 assert.equal(suggestedConnectors(db.connectors,'Student')[3].title,'Brightspace');
 assert.equal(suggestedConnectors(db.connectors,'Unknown')[0].title,'Claude Code');
});
