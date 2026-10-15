/* Simulación térmica (Maxi 14/10). Modelo de zonas (un nodo por local de LOCALES), paso de 5 min, 4 días iguales hasta que se repite
   y se muestra el último. Por zona: aire + masa (capacidad), pérdidas por muros, techo, vidrios, piso y renovación de aire,
   acople con las zonas vecinas (tabique o abierto) y con la de arriba/abajo; ganancias por sol (asoleamiento: fecha, hora, lugar),
   por uso (gente, equipos) y por la calefacción (capa «Calor» del equipamiento).
   La geometría sale del modelo: alturas por rayos al techo, bordes al exterior o a otra zona, muros de MUROS, vidrios de las piezas «glass».
   Es una estimación para comparar sistemas, no un cálculo reglamentario. */
import { solPos } from './noche.js';
export function initTermica(visor,M){
  const {THREE,scene}=visor;const V3=THREE.Vector3;
  /* clima de Ingeniero Maschwitz (la casa está en el pasaje Carhué): máximas y mínimas medias por mes (Weather Atlas) */
  const CLIMA=[[31.2,19.4],[29.9,19.2],[26.8,16.5],[23.1,14.0],[18.9,11.6],[15.6,8.8],[14.3,7.8],[17.1,9.0],[18.5,9.9],[21.7,12.2],[25.8,14.4],[29.5,17.4]];
  const TMED=CLIMA.reduce((s,[a,b])=>s+(a+b)/2,0)/12;
  /* valores de cálculo (editables) */
  const S={dia:20,noche:16,desde:7,hasta:23,ach:.8,uMuro:1.6,uTecho:1.4,uVidrio:5.8,shgc:.78,uPiso:.6,uInt:2.0,uEP:1.5,gInt:3,tipo:'tipico',sol:.65,mapa:true};
  try{Object.assign(S,JSON.parse(localStorage.getItem('carhue-termica')||'{}'));}catch(e){}
  const guardarS=()=>{try{localStorage.setItem('carhue-termica',JSON.stringify(S));}catch(e){}};
  const H_EP=262,PB=1.5;
  const pip=(x,y,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const [xi,yi]=P[i],[xj,yj]=P[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c;}return c;};
  const area=P=>{let s=0;for(let i=0,j=P.length-1;i<P.length;j=i++)s+=(P[j][0]+P[i][0])*(P[j][1]-P[i][1]);return s/2;};

  /* ---------- geometría de zonas ---------- */
  let Z=null,geoKey=null;
  function zonaEn(x,y,z){if(!Z)return null;const ep=z>=H_EP-5;let pb=null;for(const q of Z){if(!pip(x,y,q.poly))continue;if(q.ep&&ep)return q;if(!q.ep)pb=q;}return (ep&&pb&&pb.altoMax>z-pb.z0)?pb:(ep?null:pb);}
  function armarZonas(){const L=(M.LOCALES||[]).filter(l=>l.poly&&l.id!=='L-23'&&(l.nivel==='PB'||l.nivel==='EP')&&(l.nivel!=='EP'||visor.params.ep!==false));
    Z=L.map(l=>({id:l.id,nombre:l.nombre,poly:l.poly,ep:l.nivel==='EP',z0:l.nivel==='EP'?H_EP:PB,A:Math.abs(area(l.poly))/1e4}));
    const ms=[];for(const p of visor.parts||[]){if(p.grp.visible===false)continue;p.grp.traverse(o=>{if(o.isMesh)ms.push(o);});}
    const rc=new THREE.Raycaster();const ab=new V3(0,1,0);
    for(const q of Z){const xs=q.poly.map(p=>p[0]),ys=q.poly.map(p=>p[1]);let n=0,hs=0,roof=0,cint={},hmax=0;const st=50;
      for(let x=Math.min(...xs)+st/2;x<Math.max(...xs);x+=st)for(let y=Math.min(...ys)+st/2;y<Math.max(...ys);y+=st){if(!pip(x,y,q.poly))continue;n++;
        rc.set(new V3(x,q.z0+30,y),ab);rc.far=700;const h=rc.intersectObjects(ms,false)[0];let hh=h?h.point.y-q.z0:260,tipo='techo';
        if(h){const pid=h.object.userData.id;const pp=pid&&visor.parts.find(p=>p.id===pid);if(pp&&pp.cat==='glass')tipo='vidrio';else if(!q.ep&&h.point.y<H_EP+25){tipo='int';}}
        hs+=hh;hmax=Math.max(hmax,hh);if(tipo==='techo')roof++;else if(tipo==='int'){const up=zonaEn(x,y,H_EP+30);const k=up&&up!==q?up.id:'_';cint[k]=(cint[k]||0)+1;}}
      const c=st*st/1e4;q.h=n?hs/n:260;q.altoMax=hmax;q.V=q.A*q.h/100;q.Aroof=roof*c*1.08;q.arriba=Object.entries(cint).filter(([k])=>k!=='_').map(([k,v])=>[k,v*c]);}
    /* bordes: al exterior (con o sin muro) o a otra zona (tabique o abierto) */
    const muros=(M.MUROS||[]);const cerca=(x,y)=>{let best=null;for(const m of muros){const [ax,ay]=m.a,[bx,by]=m.b;const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;if(!L2)continue;const t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/L2));const d=Math.hypot(ax+dx*t-x,ay+dy*t-y);if(d<(m.e||20)/2+14&&(!best||d<best.d))best={m,d};}return best;};
    for(const q of Z){q.Aext=0;q.vec={};const P=q.poly,sgn=area(P)>0?1:-1;
      for(let i=0;i<P.length;i++){const [x0,y0]=P[i],[x1,y1]=P[(i+1)%P.length],L=Math.hypot(x1-x0,y1-y0);if(L<1)continue;let nx=(y1-y0)/L,ny=-(x1-x0)/L;{const mx=(x0+x1)/2,my=(y0+y1)/2;if(pip(mx+nx*5,my+ny*5,P)){nx=-nx;ny=-ny;}}/* normal hacia afuera (se prueba) */
        const ns=Math.max(1,Math.round(L/50));for(let k=0;k<ns;k++){const u=(k+.5)/ns,x=x0+(x1-x0)*u,y=y0+(y1-y0)*u,seg=L/ns/100;
          let o=null;for(const d of [25,45,70]){o=Z.find(r=>r!==q&&r.ep===q.ep&&pip(x+nx*d,y+ny*d,r.poly));if(o)break;}
          if(!o&&q.ep)for(const d of [25,45,70]){o=Z.find(r=>!r.ep&&r.altoMax>320&&pip(x+nx*d,y+ny*d,r.poly));if(o)break;}/* entrepiso abierto a la doble altura del living */
          const w=cerca(x,y),hh=Math.min(q.h,q.ep?160:q.h)/100;
          if(o){const v=q.vec[o.id]||(q.vec[o.id]={muro:0,abierto:0});if(w)v.muro+=seg*hh;else v.abierto+=seg*hh;}
          else if(w)q.Aext+=seg*hh;}}}
    /* vidrios al exterior: cada pieza «glass», del lado de la zona que tiene aire afuera del otro lado */
    for(const q of Z){q.vid=[];}
    const a=new V3(),b=new V3(),c=new V3(),nn=new V3();
    for(const p of visor.parts||[]){if(p.cat!=='glass'||p.grp.visible===false)continue;let A=0;const N=new V3();p.grp.updateMatrixWorld(true);
      p.grp.traverse(o=>{if(!o.isMesh)return;const P=o.geometry.attributes.position,I=o.geometry.index,cnt=I?I.count:P.count;for(let i=0;i<cnt;i+=3){const ia=I?I.getX(i):i,ib=I?I.getX(i+1):i+1,ic=I?I.getX(i+2):i+2;
        a.fromBufferAttribute(P,ia).applyMatrix4(o.matrixWorld);b.fromBufferAttribute(P,ib).applyMatrix4(o.matrixWorld);c.fromBufferAttribute(P,ic).applyMatrix4(o.matrixWorld);nn.subVectors(b,a).cross(c.clone().sub(a));const ar=nn.length()/2;A+=ar;
        nn.normalize();if(nn.dot(N)<0)nn.negate();N.addScaledVector(nn,ar);}});
      A=A/2/1e4;if(A<.05)continue;N.normalize();const bb=new THREE.Box3().setFromObject(p.grp),ctr=bb.getCenter(new V3());
      const lado=s=>{const q=ctr.clone().addScaledVector(N,s*45);return zonaEn(q.x,q.z,q.y);};const z1=lado(1),z2=lado(-1);
      if(z1&&!z2)z1.vid.push({id:p.id,A,n:N.clone().negate()});else if(z2&&!z1)z2.vid.push({id:p.id,A,n:N.clone()});}
    for(const q of Z){const Av=q.vid.filter(v=>Math.abs(v.n.y)<.7).reduce((s,v)=>s+v.A,0);q.Amuro=Math.max(0,q.Aext-Av);q.Avid=q.vid.reduce((s,v)=>s+v.A,0);}
    geoKey=visor.parts;}

  /* ---------- simulación ---------- */
  let R=null;
  const hm=s=>{const [h,m]=String(s||'0:0').split(':').map(Number);return (h||0)+(m||0)/60;};
  function calcular(){if(!Z||geoKey!==visor.parts)armarZonas();const nz=visor.noche;const fecha=nz&&nz.fecha||'2026-07-15';const mes=+fecha.slice(5,7)-1;let [tx,tn]=CLIMA[mes];if(S.tipo==='frio'){tx-=6;tn-=6;}
    const lat=nz&&nz.lat||-34.381,tz=-3,lon=nz&&nz.lon||-58.741;const Tg=TMED+((tx+tn)/2-TMED)*.3;
    const Tout=h=>{const u=((h-15+24)%24)/24;/* máx 15 h, mín ~6 h */return (tx+tn)/2+(tx-tn)/2*Math.cos(2*Math.PI*u)*.95;};
    /* sol cada hora: dirección y radiación de cielo claro × fracción de sol */
    const SOL=[];for(let h=0;h<24;h++){const sp=solPos(fecha,h*60+30,tz,lat,lon);const al=sp.alt*Math.PI/180,az=sp.az*Math.PI/180;const up=Math.sin(al);
      const dni=up>0?1000*Math.pow(.7,Math.pow(1/Math.max(up,.05),.678)):0,dhi=up>0?(.12*dni+40)*up:0;SOL.push({d:new V3(Math.cos(al)*Math.cos(az),up,Math.cos(al)*Math.sin(az)),dni:dni*S.sol,dhi:dhi*(1+.6*(1-S.sol))});}
    /* calefactores por zona */
    const its=(visor.equip&&visor.equip.items)?visor.equip.items('cal'):[];const dev=[];
    for(const it of its){if(it.t==='caldera')continue;const q=zonaEn(it.x,it.y,it.z+30);if(!q)continue;let P=it.p.kW*1000;if(it.t==='radiante')P=it.p.L*it.p.D/1e4*it.p.Wm2;dev.push({it,q,Pmax:P,P:0,E:0,serie:[]});}
    const cald=its.filter(i=>i.t==='caldera').reduce((s,i)=>s+i.p.kW,0);
    const idx=Object.fromEntries(Z.map((q,i)=>[q.id,i]));const n=Z.length;
    /* conductancias W/K */
    const G=Z.map(q=>({ext:q.Amuro*S.uMuro+q.Aroof*S.uTecho+q.Avid*S.uVidrio+.34*S.ach*q.V,suelo:q.ep?0:q.A*S.uPiso}));
    const link=[];for(const q of Z){for(const [oid,v] of Object.entries(q.vec)){const j=idx[oid];if(j==null)continue;link.push([idx[q.id],j,(v.muro*S.uInt+v.abierto*35)/2]);/* cada borde se cuenta de los dos lados: la mitad cada vez */}
      for(const [oid,A] of q.arriba){const j=idx[oid];if(j!=null)link.push([idx[q.id],j,A*S.uEP]);}}
    /* doble altura: el living se abre al estudio y al entrepiso por arriba (sin piso): acople fuerte por el aire */
    const Cap=Z.map(q=>1200*q.V+q.A*(q.ep?50e3:150e3));
    const T=Z.map(()=>S.noche),dt=300,pasos=24*3600/dt,dias=4;const serie=Z.map(()=>[]),out=[],Pz=Z.map(()=>[]);
    for(const d of dev){d.E=0;d.serie=[];}
    for(let dia=0;dia<dias;dia++)for(let s=0;s<pasos;s++){const hr=s*dt/3600,h=Math.floor(hr),so=SOL[h],To=Tout(hr);const Tset=(hr>=S.desde&&hr<S.hasta)?S.dia:S.noche;
      const Q=Z.map((q,i)=>q.A*S.gInt-G[i].ext*(T[i]-To)-G[i].suelo*(T[i]-Tg));
      /* sol por los vidrios */
      if(so.dni>0||so.dhi>0)Z.forEach((q,i)=>{for(const v of q.vid){const cs=Math.max(0,v.n.dot(so.d));Q[i]+=v.A*S.shgc*(so.dni*cs+so.dhi*(1+v.n.y)/2);}});
      for(const [i,j,g] of link){const f=g*(T[j]-T[i]);Q[i]+=f;Q[j]-=f;}
      for(const d of dev){const i=idx[d.q.id];let Pt;if(d.it.t==='salamandra'){const on=hm(d.it.p.on),off=hm(d.it.p.off);const prend=on<off?(hr>=on&&hr<off):(hr>=on||hr<off);Pt=prend?d.Pmax:0;d.P+=(Pt-d.P)*Math.min(1,dt/1800);}
        else{Pt=Math.max(0,Math.min(d.Pmax,(Tset-T[i])*3000));if(d.it.t==='radiante')d.P+=(Pt-d.P)*Math.min(1,dt/(3*3600));else d.P+=(Pt-d.P)*Math.min(1,dt/600);}
        Q[i]+=d.P;if(dia===dias-1){d.E+=d.P*dt/3600;if(s%12===0)d.serie.push(d.P);}}
      for(let i=0;i<n;i++)T[i]+=Q[i]*dt/Cap[i];
      if(dia===dias-1&&s%12===0){for(let i=0;i<n;i++)serie[i].push(T[i]);out.push(To);}}
    /* resultados */
    const sist={leña:0,gas:0,caldera:0};for(const d of dev){const s=d.it.sist;if(s==='leña')sist.leña+=d.E/1000/((d.it.p.eta||80)/100);else if(s==='gas')sist.gas+=d.E/1000/((d.it.p.eta||75)/100);else sist.caldera+=d.E/1000/.9;}
    const picoCal=dev.filter(d=>d.it.sist==='caldera').reduce((m,d)=>Math.max(m,0),0)+Math.max(0,...[...Array(24).keys()].map(h=>dev.filter(d=>d.it.sist==='caldera').reduce((s,d)=>s+(d.serie[h]||0),0)))/1000;
    R={fecha,mes,tx,tn,Z:Z.map((q,i)=>({id:q.id,nombre:q.nombre,T:serie[i],min:Math.min(...serie[i]),max:Math.max(...serie[i]),V:q.V,A:q.A,UA:G[i].ext+G[i].suelo,vid:q.Avid,ep:q.ep})),out,dev,sist,cald,picoCal};
    pintarMapa();panel();return R;}

  /* ---------- mapa térmico en 3D ---------- */
  const GM=new THREE.Group();GM.name='termica';scene.add(GM);GM.visible=false;
  const col=t=>{const u=Math.max(0,Math.min(1,(t-10)/16));const c=new THREE.Color();c.setHSL((1-u)*.66,.75,.5);return c;};
  function etiqueta(txt){const cv=document.createElement('canvas');cv.width=128;cv.height=48;const x=cv.getContext('2d');x.fillStyle='rgba(20,22,24,.8)';x.beginPath();x.roundRect(4,4,120,40,8);x.fill();x.fillStyle='#fff';x.font='bold 26px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,64,25);
    const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,sizeAttenuation:false}));sp.scale.set(.07,.026,1);sp.renderOrder=3100;return sp;}
  let mapaHora=-1;
  function pintarMapa(force){GM.visible=!!(abierta&&S.mapa&&R);if(!GM.visible)return;const nz=visor.noche;const hr=nz?nz.min/60:12;if(!force&&Math.abs(hr-mapaHora)<.05&&GM.children.length)return;mapaHora=hr;window.__despertar&&window.__despertar();
    for(const o of [...GM.children]){GM.remove(o);o.geometry&&o.geometry.dispose();if(o.material){o.material.map&&o.material.map.dispose();o.material.dispose();}}
    const h0=Math.floor(hr)%24,h1=(h0+1)%24,u=hr-Math.floor(hr);
    for(const z of R.Z){const q=Z.find(r=>r.id===z.id);if(!q)continue;const t=z.T[h0]*(1-u)+z.T[h1]*u;const sh=new THREE.Shape(q.poly.map(p=>new THREE.Vector2(p[0],-p[1])));const g=new THREE.ShapeGeometry(sh);g.rotateX(-Math.PI/2);
      const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:col(t),transparent:true,opacity:.42,depthWrite:false,side:THREE.DoubleSide}));m.position.y=q.z0+4;m.renderOrder=5;GM.add(m);
      const xs=q.poly.map(p=>p[0]),ys=q.poly.map(p=>p[1]);const sp=etiqueta(t.toFixed(1).replace('.',',')+'°');sp.position.set((Math.min(...xs)+Math.max(...xs))/2,q.z0+40,(Math.min(...ys)+Math.max(...ys))/2);GM.add(sp);}}
  setInterval(()=>{if(abierta&&R)pintarMapa();},400);

  /* ---------- panel ---------- */
  let abierta=false,selZ=null;const stage=document.querySelector('#modo-3d .stage')||document.body;
  const card=document.createElement('div');card.id='termCard';card.style.cssText='position:absolute;top:44px;right:252px;z-index:7;width:300px;max-height:calc(100% - 96px);overflow:auto;background:var(--panel);border:1px solid var(--rule);border-radius:4px;box-shadow:0 4px 14px rgba(0,0,0,.18);font-size:11px;display:none';stage.appendChild(card);
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const num=(k,lab,step,w=46)=>`<label style="display:flex;flex-direction:column;gap:1px;color:var(--muted);font-size:10px">${lab}<input data-s="${k}" type="number" step="${step}" value="${S[k]}" style="width:${w}px;font-size:11px"></label>`;
  const f1=v=>(Math.round(v*10)/10).toLocaleString('es-AR');
  function grafico(){const W=280,Hh=120;const cv=document.createElement('canvas');cv.width=W*2;cv.height=Hh*2;cv.style.width=W+'px';cv.style.height=Hh+'px';const x=cv.getContext('2d');x.scale(2,2);
    const zs=R.Z.filter(z=>selZ?z.id===selZ:true);const all=[...R.out,...zs.flatMap(z=>z.T)];const lo=Math.floor(Math.min(...all)-1),hi=Math.ceil(Math.max(...all)+1);const X=h=>24+h/23*(W-30),Y=t=>Hh-14-(t-lo)/(hi-lo)*(Hh-22);
    x.font='9px system-ui';x.fillStyle='#888';x.strokeStyle='rgba(128,128,128,.25)';x.lineWidth=1;for(let t=Math.ceil(lo/5)*5;t<=hi;t+=5){x.beginPath();x.moveTo(24,Y(t));x.lineTo(W-6,Y(t));x.stroke();x.fillText(t+'°',2,Y(t)+3);}
    for(const h of [0,6,12,18,23]){x.fillText(String(h),X(h)-3,Hh-3);}
    x.fillStyle='rgba(224,162,28,.12)';x.fillRect(X(S.desde),Y(S.dia)-1,X(Math.min(23,S.hasta))-X(S.desde),2);
    const linea=(arr,c,w,dash)=>{x.strokeStyle=c;x.lineWidth=w;x.setLineDash(dash||[]);x.beginPath();arr.forEach((t,h)=>{h?x.lineTo(X(h),Y(t)):x.moveTo(X(h),Y(t));});x.stroke();x.setLineDash([]);};
    linea(R.out,'#7d838a',1.2,[3,3]);const pal=['#c0461f','#2f6db3','#2a9d5c','#9b4dca','#d98c00','#0f8b8d','#b23a6b','#5a6b2b'];
    zs.slice(0,selZ?1:8).forEach((z,i)=>linea(z.T,pal[i%pal.length],1.6));
    const nz=visor.noche;if(nz){const h=nz.min/60;x.strokeStyle='rgba(226,70,43,.6)';x.beginPath();x.moveTo(X(Math.min(23,h)),8);x.lineTo(X(Math.min(23,h)),Hh-14);x.stroke();}
    return {cv,leyenda:zs.slice(0,selZ?1:8).map((z,i)=>`<span style="color:${pal[i%pal.length]}">━ ${esc(z.id)}</span>`).join(' ')+' <span style="color:#7d838a">┅ afuera</span>'};}
  function panel(){if(!abierta)return;const nz=visor.noche;const mes=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const esc2=visor.equip&&visor.equip.escenarios?visor.equip.escenarios('cal'):{};
    let h=`<div class="th" style="display:flex;align-items:center;gap:4px;padding:5px 6px 5px 9px;border-bottom:1px solid var(--rule)"><span style="flex:1;color:var(--muted)">Simulación por ambiente</span><button class="btn" data-a="calc" style="padding:2px 8px;font-size:11px">Calcular</button></div><div style="padding:7px 9px">
      <div style="color:var(--muted);margin-bottom:5px">Día ${S.tipo==='frio'?'frío':'típico'} de ${mes[R?R.mes:((nz&&+nz.fecha.slice(5,7))||7)-1]} en Ing. Maschwitz (cambiá la fecha abajo) · afuera ${R?`${f1(R.tn)}° a ${f1(R.tx)}°`:''}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:flex-end;margin-bottom:6px">${num('dia','día °C',.5)}${num('noche','noche °C',.5)}${num('desde','de h',1,38)}${num('hasta','a h',1,38)}
        <label style="display:flex;flex-direction:column;gap:1px;color:var(--muted);font-size:10px">día<select data-s="tipo" style="font-size:11px"><option value="tipico"${S.tipo==='tipico'?' selected':''}>típico</option><option value="frio"${S.tipo==='frio'?' selected':''}>frío (−6°)</option></select></label>
        <label style="display:flex;gap:3px;align-items:center"><input type="checkbox" data-s="mapa"${S.mapa?' checked':''}>mapa 3D</label></div>
      <details style="margin-bottom:6px"><summary style="cursor:pointer;color:var(--muted)">Envolvente y supuestos</summary><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:5px">${num('uMuro','U muros',.1)}${num('uTecho','U techo',.1)}${num('uVidrio','U vidrio',.1)}${num('shgc','factor solar',.05)}${num('ach','renov./h',.1)}${num('sol','sol %',.05)}${num('gInt','uso W/m²',.5)}</div>
        <div style="color:var(--muted);margin-top:4px;line-height:1.35">Muros de ladrillo/piedra 35 cm ≈ 1,6 · techo de chapa con 10 mm de poliuretano plateado y machimbre ≈ 1,4 · vidrio simple 5,8 · renovación 0,8/h (carpinterías viejas) · sol: fracción de horas de sol del mes. Clima: medias de Ing. Maschwitz de <a href="https://www.weather-atlas.com/en/argentina/ingeniero-maschwitz-climate" target="_blank">Weather Atlas</a> (modeladas; las noches de helada se ven mejor con «día frío»).</div></details>
      <div style="margin-bottom:6px"><b>Sistemas</b> <button class="btn" data-a="todosA" style="padding:1px 6px;font-size:10px">todo A</button> <button class="btn" data-a="todosB" style="padding:1px 6px;font-size:10px">todo B</button><span style="color:var(--muted)"> · escenarios de cada ambiente abajo</span>
        <div style="margin-top:3px;color:var(--muted);line-height:1.4">${Object.entries(esc2).filter(([a,v])=>Object.keys(v.esc).length>1||v.esc[v.activo]!=='Sin calefacción').map(([a,v])=>`${esc(a)}: <span style="color:var(--ink,inherit)">${esc(v.esc[v.activo])}</span>`).join(' · ')}</div></div>`;
    if(R){const g=grafico();h+=`<div data-graf></div><div style="font-size:10px;margin:2px 0 6px">${g.leyenda} ${selZ?'<a href="#" data-a="todas">ver todas</a>':''}</div>
      <table style="width:100%;border-collapse:collapse;font-size:10.5px"><tr style="color:var(--muted);text-align:left"><th>zona</th><th>mín</th><th>máx</th><th title="pérdida por grado (envolvente + aire)">W/°C</th><th>vidrio m²</th></tr>
      ${R.Z.map(z=>`<tr data-z="${esc(z.id)}" style="cursor:pointer;${z.id===selZ?'background:var(--accent-soft)':''}"><td title="${esc(z.nombre)}">${esc(z.id)} <span style="color:var(--muted)">${esc((z.nombre||'').slice(0,16))}</span></td><td style="color:${col(z.min).getStyle()}">${f1(z.min)}°</td><td>${f1(z.max)}°</td><td>${Math.round(z.UA)}</td><td>${f1(z.vid)}</td></tr>`).join('')}</table>
      <div style="margin-top:7px;line-height:1.5"><b>Consumo del día</b><br>
      ${R.dev.map(d=>`${esc(d.it.n.split(' (')[0])} · ${esc(d.q.id)}: ${f1(d.E/1000)} kWh`).join('<br>')||'<span style="color:var(--muted)">Sin calefactores en la capa «Calor».</span>'}<br>
      ${R.sist.leña?`Leña ≈ ${f1(R.sist.leña/4)} kg/día (${f1(R.sist.leña*30/4)} kg/mes) · `:''}${R.sist.gas?`Gas tiro balanceado ≈ ${f1(R.sist.gas/9.3)} m³/día · `:''}${R.sist.caldera?`Gas calderas ≈ ${f1(R.sist.caldera/9.3)} m³/día (pico ${f1(R.picoCal)} kW de ${R.cald||'—'} kW de calderas)`:''}</div>`;}
    else h+=`<div style="color:var(--muted)">Tocá «Calcular». Usa la fecha del asoleamiento para el mes y la hora para el mapa.</div>`;
    h+='</div>';card.innerHTML=h;if(R){const g=grafico();card.querySelector('[data-graf]').appendChild(g.cv);}}
  card.addEventListener('click',e=>{const a=e.target.closest('[data-a]');if(a){e.preventDefault();const k=a.dataset.a;if(k==='x')return api.toggle(false);if(k==='calc'){a.textContent='…';setTimeout(()=>calcular(),20);return;}if(k==='todas'){selZ=null;panel();return;}
      if((k==='todosA'||k==='todosB')&&visor.equip){const es=visor.equip.escenarios('cal');for(const amb in es)if(es[amb].esc[k.slice(-1)])visor.equip.setActivo('cal',amb,k.slice(-1));setTimeout(calcular,50);return;}
      if(k==='calor'&&visor.equip){visor.equip.toggle('cal');return;}}
    const tr=e.target.closest('[data-z]');if(tr){selZ=selZ===tr.dataset.z?null:tr.dataset.z;panel();}});
  card.addEventListener('change',e=>{const t=e.target,k=t.dataset.s;if(!k)return;S[k]=t.type==='checkbox'?t.checked:t.tagName==='SELECT'?t.value:+t.value;guardarS();if(k==='mapa'){pintarMapa(true);return;}calcular();});
  card.addEventListener('keydown',e=>e.stopPropagation());
  /* sin arrastre: vive en la barra derecha */
  let lastFecha=null;setInterval(()=>{const nz=visor.noche;if(abierta&&R&&nz&&nz.fecha!==lastFecha){lastFecha=nz.fecha;calcular();}},1000);
  const api={toggle(v){abierta=v==null?!abierta:v;card.style.display=abierta?'block':'none';if(abierta){if(!R)setTimeout(calcular,30);else panel();}pintarMapa(true);const eq=visor.equip;if(eq){/* los calefactores y sus escenarios viven dentro de la térmica */if(abierta){if(!(eq.open&&eq.capa==='cal'))eq.toggle('cal');}else if(eq.open&&eq.capa==='cal')eq.toggle();eq.vis&&eq.vis();}window.__side&&window.__side.sync();return abierta;},get abierta(){return abierta;},calcular,get R(){return R;},S,zonas:()=>Z};
  visor.termica=api;return api;
}
