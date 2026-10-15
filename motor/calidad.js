/* Gráficos (Maxi 14/10, la placa chillaba): cuatro niveles para lo que más pesa.
   alto: como siempre · medio: resolución ×1,5 máx., sombras cada 2 cuadros, follaje sin sombra de hojas, 16 luces de noche con 2 sombras
   liviano: resolución ×1, sombras cada 6 cuadros, plantas simplificadas, sin oclusión ambiental ni brillo, 12 luces sin sombras
   mínimo: resolución ×0,75, sin sombras, plantas como cuerpos simples, 8 luces. Queda recordado en este navegador. */
export function initCalidad(visor){
  const {renderer,scene}=visor;
  const N={alto:{pr:2,som:1,luces:24,ssp:4,bloom:.55,ao:true},medio:{pr:1.5,som:2,luces:16,ssp:2,bloom:.45,ao:true},liviano:{pr:1,som:6,luces:12,ssp:0,bloom:0,ao:false},minimo:{pr:.75,som:0,luces:8,ssp:0,bloom:0,ao:false}};
  let modo='alto';try{const m=localStorage.getItem('carhue-calidad');if(N[m])modo=m;}catch(e){}
  let n=0;
  (function loop(){requestAnimationFrame(loop);const c=N[modo];if(!c.som)return;n++;if(c.som===1){renderer.shadowMap.autoUpdate=true;return;}renderer.shadowMap.autoUpdate=false;if(n%c.som===0)renderer.shadowMap.needsUpdate=true;})();
  function aplicar(primera){const c=N[modo];renderer.setPixelRatio(Math.min(devicePixelRatio,c.pr));
    const somOn=c.som>0;if(renderer.shadowMap.enabled!==somOn){renderer.shadowMap.enabled=somOn;scene.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true);});}
    if(somOn){renderer.shadowMap.needsUpdate=true;}
    if(visor._gtao)visor._gtao.enabled=c.ao;
    if(!primera&&visor.noche){visor.noche.set('max',c.luces);visor.noche.set('som',c.ssp);visor.noche.set('bloom',c.bloom);}
    if(!primera&&visor.equip&&visor.equip.rearmar)visor.equip.rearmar();
    sel.value=modo;}
  const bar=document.querySelector('#modo-3d .bottombar');const lb=document.createElement('label');lb.title='Calidad de gráficos: bajala si la placa sufre (sombras, follaje, luces de noche, resolución).';
  lb.innerHTML='Gráficos <select><option value="alto">Alto</option><option value="medio">Medio</option><option value="liviano">Liviano</option><option value="minimo">Mínimo</option></select>';const sel=lb.querySelector('select');
  if(bar)bar.prepend(lb);sel.addEventListener('change',()=>{modo=sel.value;try{localStorage.setItem('carhue-calidad',modo);}catch(e){}aplicar(false);});
  visor.calidad={get modo(){return modo;},set(m){if(N[m]){modo=m;sel.value=m;aplicar(false);}}};
  setTimeout(()=>aplicar(true),700);
  return visor.calidad;
}
