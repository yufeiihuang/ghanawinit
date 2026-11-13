export const sidebarPages = ['Home','Inbox','Calendar','Goals','Specs','Library','Memory','Agents','Skills','Connectors','Collab'];
export function sidebarPreferences(value={}) {
 const valid=list=>[...new Set(Array.isArray(list)?list.filter(p=>sidebarPages.includes(p)):[])];
 const favorites=valid(value?.favorites);
 return {favorites,hidden:valid(value?.hidden).filter(p=>p!=='Home'&&!favorites.includes(p))};
}
export function sidebarSections(groups,value) {
 const {favorites,hidden}=sidebarPreferences(value);
 const visible=groups.map(([label,pages])=>[label,pages.filter(p=>!hidden.includes(p)&&!favorites.includes(p))]).filter(([,pages])=>pages.length);
 const overview=visible[0]?.[0]===''?visible.shift():null;
 return [...(overview?[overview]:[]),...(favorites.length?[['Favourites',favorites]]:[]),...visible];
}
