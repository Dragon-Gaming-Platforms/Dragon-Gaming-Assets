import {t} from './i18n.js';
import {controls,focusStep,navigate,adjustControl} from './navigation.js';
import {titleHTML,mountTitle} from './title.js';
import {enhance,MenuRepeat,menuState} from './menus.js';

// The device last used for menus (keys, pad or touch) drives the shown hints (styles.css html[data-input]).
const device=(doc,value)=>{if(doc?.documentElement?.dataset)doc.documentElement.dataset.input=value;};

export class Screens {
 constructor(root,target=window) {
  this.root=root;this.name='title';this.actions={};this.revision=0;this.cleanup=null;this.links={};this.repeater=new MenuRepeat();
  const doc=root.ownerDocument;
  // Bubble after the button's action: a new session may have just stopped old effects.
  root.addEventListener?.('click',event=>{
   if(event.target.closest('button,a[href]'))this.onCue?.('menu-select');
  });
  root.addEventListener?.('change',event=>{
   if(event.target.matches('input,select'))this.onCue?.('menu-move');
  });
  // Pointer hover moves the focus too, so keys and pads carry on from what the mouse points at;
  // the focused control always wears the amber ring (pad focus is programmatic, never :focus-visible).
  root.addEventListener?.('pointerover',event=>{
   const control=event.target.closest?.('button,select,input,a[href]');
   if(event.pointerType==='touch'||!control||doc.activeElement===control||!controls(this.root).includes(control))return;
   control.focus({preventScroll:true});
  });
  root.addEventListener?.('focusin',event=>event.target.classList?.add('focused'));
  root.addEventListener?.('focusout',event=>event.target.classList?.remove('focused'));
  target.addEventListener('pointerdown',event=>device(doc,event.pointerType==='touch'?'touch':'keys'),true);
  target.addEventListener('keydown',e=>{
   device(doc,'keys');
   // In play the arrows and Space belong to the hunter, never to a stray control.
   if(!this.root.children.length||['playing','respawn','round'].includes(this.name))return;
   const items=controls(this.root);
   if(e.target.matches('input,select,textarea')){
    // Up/down always leave a field (as on a pad), left/right edit a selector, Enter moves on.
    const field=e.target,select=field.tagName==='SELECT',text=!select&&field.type!=='range'&&field.type!=='file';
    if(!items.includes(field))return;
    if(e.code==='ArrowUp'||e.code==='ArrowDown'){e.preventDefault();focusStep(items,field,e.code==='ArrowUp'?-1:1);this.onCue?.('menu-move');}
    else if(select&&(e.code==='ArrowLeft'||e.code==='ArrowRight')){e.preventDefault();adjustControl(field,e.code==='ArrowLeft'?-1:1);}
    else if(e.code==='Enter'&&(select||text)){e.preventDefault();focusStep(items,field,1);this.onCue?.('menu-move');}
    return;
   }
   if(e.code==='Backspace'){e.preventDefault();this.back();return;}
   if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Tab'].includes(e.code)){
    if(!items.length)return;
    e.preventDefault();
    focusStep(items,this.root.ownerDocument.activeElement,['ArrowLeft','ArrowUp'].includes(e.code)||e.shiftKey?-1:1);
    this.onCue?.('menu-move');
   }else if(e.code==='Space'||e.code==='Enter'){
    e.preventDefault();
    const active=this.root.ownerDocument.activeElement;
    (items.includes(active)?active:items[0])?.click();
   }
  });
 }

 leave() {
  this.cleanup?.();this.cleanup=null;
  this.onChange?.();
  this.revision++;
 }

 show(name,html,actions={}) {
  this.leave();this.name=name;this.actions=actions;this.root.innerHTML=html;this.repeater.block();
  for(const [id,fn] of Object.entries(actions))this.root.querySelector(`[data-action="${id}"]`)?.addEventListener('click',fn);
  // Screen polish (src/ui/menus.js): hero portraits, the empty-Hall way forward, lesson switches.
  this.cleanup=enhance(name,this.root,{links:{back:()=>this.back(),...this.links}});
  // Focus lands on the screen's main action (Play, Descend, Begin the hunt) so one press goes on.
  const items=controls(this.root),primary=this.root.querySelector?.('.primary:not(:disabled)');
  const first=items.includes(primary)?primary:items[0];
  first?.focus({preventScroll:true});
  // On a short screen the main action may sit below the fold: bring it into view (panel scroll only).
  if(first===primary)primary?.scrollIntoView?.({block:'nearest'});
 }

 clear() {
  this.leave();this.name='playing';this.actions={};this.root.innerHTML='';
  this.root.ownerDocument.activeElement?.blur();
 }

 // Held pad directions repeat after a short delay (main.js menuPad ORs this into the polled edges).
 repeat(held,now){return this.repeater.step(held,now);}

 navigate(menu){
  const active=this.root.ownerDocument.activeElement;
  device(this.root.ownerDocument,'pad');
  navigate(this.root,menu);
  if(this.root.ownerDocument.activeElement!==active)this.onCue?.('menu-move');
 }
 back(){
  const action=this.actions.back||this.actions.resume||this.actions.home;
  if(action){action();this.onCue?.('menu-select');}
 }

 title(actions,noWebGL=false) {
  this.show('title',titleHTML(noWebGL),actions);
  // Clicking a hunter on the ridge opens the select screen with that form chosen.
  const mounted=mountTitle(this.root,{onPick:kind=>{menuState.kind=kind;this.onCue?.('menu-select');actions.play?.();}}),prior=this.cleanup;
  this.cleanup=()=>{mounted();prior?.();};
 }

 simple(name,text,back) {
  this.show(name,`<section class="panel"><h2>${t(name)}</h2><p>${text}</p><button data-action="back">${t('back')}</button></section>`,{back});
 }
}
