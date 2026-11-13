import test from 'node:test';
import assert from 'node:assert/strict';
import { sidebarPreferences, sidebarSections } from '../src/sidebar.js';
import { navGroups } from '../src/data.js';
test('sidebar preferences reject removed pages and keep Home and favourites visible',()=>{
 assert.deepEqual(sidebarPreferences({favorites:['Library','Library','Logs'],hidden:['Home','Library','Skills','Trash']}),{favorites:['Library'],hidden:['Skills']});
 assert.deepEqual(sidebarPreferences(null),{favorites:[],hidden:[]});
});
test('favourites preserve order without duplicating pages or hiding settings',()=>{
 const sections=sidebarSections(navGroups,{favorites:['Agents','Library'],hidden:['Skills']});
 assert.deepEqual(sections[1],['Favourites',['Agents','Library']]);
 const pages=sections.flatMap(([,pages])=>pages);
 assert.equal(pages.filter(p=>p==='Library').length,1);
 assert(!pages.includes('Skills'));assert(pages.includes('Settings'));assert(!pages.includes('Logs'));assert(!pages.includes('Trash'));
 assert.deepEqual(sidebarSections(navGroups,{}),navGroups);
});
