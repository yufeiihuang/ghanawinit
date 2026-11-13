const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const helpText={
 Memory:'Information Speqq remembers and uses to help you later',
 Skills:'Instructions that teach a routine how to handle a specific task',
 Connectors:'Link apps so Speqq can use information from them',
 Agents:'Tasks Speqq repeats for you, on a schedule or when something happens',
 schedule:'What starts this routine, such as a schedule or a new file',
 context:'Choose files or information to include with your question',
 permission:'Read only lets this routine use selected files without changing them',
 keep:'Routines won’t move this file or folder'
};
export function helpButton(label,key){return `<button type="button" class="help-button" data-help="${esc(helpText[key])}" aria-label="About ${esc(label)}"><span aria-hidden="true">?</span></button>`;}
let target,tip;
export function dismissTooltip(){if(target?.getAttribute('aria-describedby')==='speqq-help-tooltip')target.removeAttribute('aria-describedby');tip?.remove();target=null;tip=null;}
export function installTooltips(){
 const show=el=>{if(target===el)return;dismissTooltip();target=el;tip=document.createElement('div');tip.id='speqq-help-tooltip';tip.className='help-tooltip';tip.role='tooltip';tip.textContent=el.dataset.help;document.body.append(tip);el.setAttribute('aria-describedby',tip.id);const r=el.getBoundingClientRect(),box=tip.getBoundingClientRect();let left=r.right+10,top=r.top+(r.height-box.height)/2;if(left+box.width>innerWidth-12){left=Math.min(r.left,innerWidth-box.width-12);top=r.bottom+8;}tip.style.left=Math.max(12,left)+'px';tip.style.top=Math.max(12,Math.min(top,innerHeight-box.height-12))+'px';};
 document.addEventListener('pointerover',e=>{const el=e.target.closest('[data-help]');if(el)show(el);});
 document.addEventListener('pointerout',e=>{if(target&&!target.contains(e.relatedTarget)&&target.contains(e.target))dismissTooltip();});
 document.addEventListener('focusin',e=>{const el=e.target.closest('[data-help]');if(el)show(el);});
 document.addEventListener('focusout',e=>{if(target?.contains(e.target))dismissTooltip();});
 document.addEventListener('click',e=>{const el=e.target.closest('[data-help]');if(el?.classList.contains('help-button'))show(el);else dismissTooltip();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')dismissTooltip();});
 document.addEventListener('scroll',dismissTooltip,true);window.addEventListener('resize',dismissTooltip);
}
