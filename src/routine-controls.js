export function organizationPlan(files, library, access={}) {
 if(access.permission!=='organize'||!access.destination?.trim()||(library.lockedFolders||[]).includes(access.destination.trim()))return [];
 const ids=access.files||[],folders=access.folders||[];
 return files.filter(f=>(ids.includes(f.id)||folders.includes(f.folder))&&!f.keepInPlace&&!(library.lockedFolders||[]).includes(f.folder)&&f.folder!==access.destination.trim())
 .map(f=>({id:f.id,name:f.name,from:f.folder||'',to:access.destination.trim()}));
}
export function applyOrganization(files,library,access,proposed) {
 const allowed=organizationPlan(files,library,access);
 const applied=allowed.filter(p=>proposed.some(x=>x.id===p.id&&x.from===p.from&&x.to===p.to));
 const saved={...library,files:[...library.files],folders:[...library.folders]};
 for(const p of applied){const file=files.find(f=>f.id===p.id);saved.files=saved.files.filter(f=>f.id!==p.id);saved.files.push({...file,folder:p.to});if(!saved.folders.includes(p.to))saved.folders.push(p.to);}
 return {saved,applied,createdFolders:saved.folders.filter(f=>!library.folders.includes(f))};
}
export function undoOrganization(library,changes,createdFolders=[]) {
 const restored={...library,files:library.files.map(f=>{const change=changes.find(c=>c.id===f.id&&c.to===f.folder);return change?{...f,folder:change.from}:f;})};
 restored.folders=restored.folders.filter(folder=>!createdFolders.includes(folder)||restored.files.some(f=>f.folder===folder));
 return restored;
}
