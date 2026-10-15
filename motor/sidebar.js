/* Barra derecha en acordeón (Maxi 14/10): no hay más paneles flotantes. Todo panel que se abre (inspector, opciones de diseño,
   outliner, capas, equipamiento, térmica con sus calefactores, asoleamiento, corte, personas, medir, señalar, editar, marcas)
   aparece como una sección plegable de esta barra; la × de la sección lo cierra. El ancho se cambia arrastrando el borde izquierdo. */
export function initSidebar(visor){
  const M3=document.getElementById('modo-3d'),side=document.getElementById('insp');if(!M3||!side)return;
  const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
  const css=document.createElement('style');css.textContent=`
#modo-3d.sinaside.inspon{grid-template-columns:minmax(0,1fr) 0 var(--side-w,230px)!important}
#insp{position:relative}#insp>.ih{display:none!important}
#insp .acc{flex:1 1 auto;min-height:0;overflow:auto;overscroll-behavior:contain}
#insp .sec{border-bottom:1px solid var(--rule)}#insp .sec[hidden]{display:none}
#insp .sh{display:flex;align-items:center;gap:4px;padding:4px 3px 4px 6px;cursor:pointer;user-select:none;position:sticky;top:0;z-index:2;background:var(--panel);border-bottom:1px solid transparent}
#insp .sec:not(.fold) .sh{border-bottom-color:var(--rule)}
#insp .sh .chev{width:10px;color:var(--muted);font-size:9px;flex:none}
#insp .sh b{flex:1;min-width:0;font:600 10px var(--f-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#insp .sh .sx{background:none;border:0;cursor:pointer;color:var(--muted);font-size:13px;line-height:14px;padding:1px 5px;border-radius:3px}#insp .sh .sx:hover{background:var(--accent-soft)}
#insp .sec.fold .sb{display:none}
#insp .sb{font-size:10.5px}
#insp .docked{position:static!important;inset:auto!important;left:auto!important;top:auto!important;right:auto!important;bottom:auto!important;transform:none!important;width:auto!important;max-width:none!important;max-height:none!important;overflow:visible!important;box-shadow:none!important;border:0!important;border-radius:0!important;margin:0!important;z-index:auto!important;background:transparent!important;font-size:11px!important}
#insp .docked .mh,#insp #capasPanel .cph,#insp #vzX,#insp #termCard .th .tx,#insp #eqCard [data-a="cerrar"]{display:none!important}
#insp #capasPanel.fold .cpbody{display:block}
#insp #varCard{margin:0!important;padding:4px 8px 6px!important;border:0!important;box-shadow:none!important;max-height:none!important}
#insp .sel{max-height:none!important;border-bottom:0!important}
#insp .ol{min-height:0!important}#insp .ol .tree{max-height:46vh}
#insp .sbx{padding:6px 8px}
#insp .sgrip{position:absolute;left:-4px;top:0;bottom:0;width:8px;cursor:ew-resize;z-index:5}#insp .sgrip:hover,#insp .sgrip.on{background:linear-gradient(90deg,transparent 3px,var(--accent,#c0461f) 3px,var(--accent,#c0461f) 5px,transparent 5px)}
#insp #termCal:empty{display:none}#insp #termCal{border-top:1px solid var(--rule);padding:6px 9px 4px}
#insp .tcalh{font:600 10px var(--f-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:4px}`;
  document.head.appendChild(css);
  M3.style.setProperty('--side-w',LS.get('carhue-side-w',230)+'px');
  const acc=document.createElement('div');acc.className='acc';side.appendChild(acc);
  const grip=document.createElement('div');grip.className='sgrip';grip.title='Arrastrá para cambiar el ancho';side.appendChild(grip);
  grip.addEventListener('pointerdown',e=>{e.preventDefault();grip.setPointerCapture(e.pointerId);grip.classList.add('on');const x0=e.clientX,w0=side.getBoundingClientRect().width;
    const mv=ev=>{const w=Math.max(170,Math.min(Math.round(innerWidth*.6),w0+(x0-ev.clientX)));M3.style.setProperty('--side-w',w+'px');dispatchEvent(new Event('resize'));};
    const up=()=>{grip.classList.remove('on');grip.removeEventListener('pointermove',mv);grip.removeEventListener('pointerup',up);LS.set('carhue-side-w',Math.round(side.getBoundingClientRect().width));dispatchEvent(new Event('resize'));};
    grip.addEventListener('pointermove',mv);grip.addEventListener('pointerup',up);});
  const fold=LS.get('carhue-side-fold',{});
  const S={};/* id → {sec,body,vis(),close(),title} */
  function sec(id,title,o){const s=document.createElement('section');s.className='sec'+(fold[id]?' fold':'');s.dataset.id=id;s.hidden=true;
    s.innerHTML=`<div class="sh"><span class="chev">${fold[id]?'▸':'▾'}</span><b></b><button class="sx" title="Cerrar">×</button></div><div class="sb"></div>`;s.querySelector('b').textContent=title;
    acc.appendChild(s);const r={sec:s,body:s.querySelector('.sb'),...o};S[id]=r;
    s.querySelector('.sh').addEventListener('click',e=>{if(e.target.closest('.sx')){r.close&&r.close();setTimeout(sync,0);return;}fold[id]=!fold[id];LS.set('carhue-side-fold',fold);s.classList.toggle('fold',!!fold[id]);s.querySelector('.chev').textContent=fold[id]?'▸':'▾';});
    return r;}
  const shown=el=>!!el&&!el.hidden&&el.style.display!=='none';
  const dock=(r,el)=>{if(!el||r.body.contains(el))return;el.classList.add('docked');r.body.appendChild(el);};
  const $=id=>document.getElementById(id);
  const I=visor.inspector||{};

  /* orden fijo, de lo más usado a lo eventual */
  const selEl=side.querySelector('.sel'),olEl=side.querySelector('.ol');
  sec('sel','Selección',{vis:()=>selEl&&!selEl.hidden,close:()=>visor.resetSel&&visor.resetSel()});if(selEl)S.sel.body.appendChild(selEl);
  sec('var','Opciones de diseño',{vis:()=>shown($('varCard')),close:()=>{const x=$('vzX');x&&x.click();}});
  sec('ol','Outliner',{vis:()=>!!I.abierto,close:()=>I.show&&I.show(false)});if(olEl)S.ol.body.appendChild(olEl);
  sec('capas','Capas',{vis:()=>shown($('capasPanel')),close:()=>{const x=document.querySelector('#capasPanel [data-cp="x"]');x&&x.click();}});
  sec('equip','Equipamiento',{vis:()=>shown($('eqCard'))&&!(visor.equip&&visor.equip.capa==='cal'&&visor.termica&&visor.termica.abierta),close:()=>{visor.equip&&visor.equip.open&&visor.equip.toggle();}});
  const T=sec('term','Térmica y calefacción',{vis:()=>shown($('termCard')),close:()=>visor.termica&&visor.termica.toggle(false)});
  const tcal=document.createElement('div');tcal.id='termCal';
  sec('sol','Lugar del asoleamiento',{vis:()=>shown(visor.noche&&visor.noche.pop),close:()=>{if(visor.noche&&visor.noche.pop)visor.noche.pop.hidden=true;}});
  const CO=sec('corte','Cortes',{vis:()=>CO.on,close:()=>{CO.on=false;}});CO.on=false;
  const PE=sec('pers','Personas',{vis:()=>PE.on,close:()=>{PE.on=false;}});PE.on=false;
  sec('med','Medir',{vis:()=>shown($('medPanel')),close:()=>{const x=document.querySelector('#medPanel .mx');x&&x.click();}});
  sec('sen','Señalar',{vis:()=>shown($('senPanel')),close:()=>{const x=document.querySelector('#senPanel .mx');x&&x.click();}});
  sec('ed','Editar',{vis:()=>shown($('edPanel')),close:()=>{const x=document.querySelector('#edPanel .mx');x&&x.click();}});
  sec('mk','Marcas',{vis:()=>shown($('marcasPanel')),close:()=>{const x=document.querySelector('#marcasPanel .mx');x&&x.click();}});

  function adopt(){dock(S.var,$('varCard'));dock(S.capas,$('capasPanel'));dock(T,$('termCard'));if(!T.body.contains(tcal))T.body.appendChild(tcal);
    if(visor.noche&&visor.noche.pop)dock(S.sol,visor.noche.pop);
    dock(S.med,$('medPanel'));dock(S.sen,$('senPanel'));dock(S.ed,$('edPanel'));dock(S.mk,$('marcasPanel'));
    /* el equipamiento: con la capa «Calor» y la térmica abierta vive dentro de la térmica */
    const eq=$('eqCard');if(eq){eq.classList.add('docked');const enT=visor.equip&&visor.equip.capa==='cal'&&visor.termica&&visor.termica.abierta;
      if(enT){if(!tcal.contains(eq)){tcal.innerHTML='<div class="tcalh">Calefactores por ambiente</div>';tcal.appendChild(eq);}}
      else{if(!S.equip.body.contains(eq)){S.equip.body.appendChild(eq);tcal.innerHTML='';}}}
    const cap=$('capasPanel');if(cap)cap.classList.remove('fold');}
  const titEq={mue:'Muebles',luz:'Luces',veg:'Plantas',cal:'Calefactores'};
  let prev={};
  function sync(){adopt();mirar();let any=false;for(const [id,r] of Object.entries(S)){const v=!!r.vis();if(r.sec.hidden!==!v)r.sec.hidden=!v;if(v)any=true;
      if(v&&!prev[id]){/* recién abierta: desplegada y a la vista */if(fold[id]){fold[id]=false;LS.set('carhue-side-fold',fold);r.sec.classList.remove('fold');r.sec.querySelector('.chev').textContent='▾';}requestAnimationFrame(()=>r.sec.scrollIntoView({block:'nearest'}));}
      prev[id]=v;}
    if(visor.equip)S.equip.sec.querySelector('b').textContent=titEq[visor.equip.capa]||'Equipamiento';
    const was=M3.classList.contains('inspon');{const d=any?'flex':'none';if(side.style.display!==d)side.style.display=d;}M3.classList.toggle('inspon',any);if(was!==any)setTimeout(()=>dispatchEvent(new Event('resize')),30);}
  /* abrir/cerrar secciones propias (cortes y personas, que antes eran menús flotantes) */
  function toggle(id,v){if(id==='corte'){CO.on=v==null?!CO.on:v;if(CO.on&&visor.corteBox)dock(CO,visor.corteBox);}
    if(id==='personas'){PE.on=v==null?!PE.on:v;if(PE.on&&visor.personas){PE.body.innerHTML='';const d=document.createElement('div');d.className='docked sbx';PE.body.appendChild(d);visor.personas.renderInto(d,()=>{PE.on=false;sync();});}}
    sync();return id==='corte'?CO.on:PE.on;}
  /* se miran sólo los paneles (no todo el 3D, que cambia estilos en cada cuadro) */
  const mo=new MutationObserver(()=>{if(mo.t)return;mo.t=setTimeout(()=>{mo.t=0;sync();},0);});const vistos=new Set();
  const mirar=()=>{for(const el of [$('varCard'),$('capasPanel'),$('eqCard'),$('termCard'),visor.noche&&visor.noche.pop,$('medPanel'),$('senPanel'),$('edPanel'),$('marcasPanel'),selEl])if(el&&!vistos.has(el)){vistos.add(el);mo.observe(el,{attributes:true,attributeFilter:['hidden','style']});}};
  setInterval(sync,400);sync();
  /* secciones que agregan otros módulos (p. ej. estructura): se ubican antes de «Lugar del asoleamiento» */
  function add(id,title,el,vis,close){if(S[id])return S[id];const r=sec(id,title,{vis,close});acc.insertBefore(r.sec,S.sol.sec);dock(r,el);sync();return r;}
  const api={sync,toggle,add,get abierto(){return side.style.display!=='none';},isOn:id=>id==='corte'?CO.on:id==='personas'?PE.on:false};
  window.__side=api;visor.sidebar=api;return api;
}
