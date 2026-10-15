/* Calefacción (Maxi 14/10): artefactos que usa la simulación térmica, ubicables como los muebles (capa «Calor»).
   kW = potencia útil que entrega al ambiente. La salamandra es diseño propio: doble combustión, alto rendimiento,
   tiraje recto que cruza el techo del living. Frente hacia +z local. */
export function catalogoCal(THREE,B,CYL){
  const K=['kW','kW útiles','num'];
  return {
    salamandra:{n:'Salamandra de doble combustión (diseño)',sist:'leña',p:{kW:8,eta:80,on:'18:00',off:'24:00'},
      ui:[K,['eta','rendimiento %','num'],['on','prende','time'],['off','apaga','time']],
      g:(p,ctx)=>{const H=(ctx&&ctx.techo?ctx.techo():420)+90;/* el caño sale 90 por encima del techo */const g=[
        [B(-28,28,0,6,-24,24),'grafito'],/* zócalo / cenicero */
        [B(-27,27,6,104,-22,22),'negro'],/* cuerpo de acero de 6 mm */
        [B(-20,20,32,82,22,22.6),'vidrioN'],[B(-21,21,31,83,22.6,23.4),'negro'],/* puerta con vitrocerámica */
        [B(-16,16,36,52,21.5,22.2),'llama'],/* brasa, se ve por el vidrio */
        [B(21,23,48,66,23.4,26),'acero'],/* manija */
        [B(-27,27,104,107,-22,22),'acero'],/* tapa de fundición */
        [CYL(7.5,107,H-14,0,-4,24),'negro'],/* caño de doble pared Ø15, recto */
        [CYL(9.5,H-14,H-10,0,-4,24),'acero'],[new THREE.ConeGeometry(14,10,24).translate(0,H+2,-4),'acero'],[CYL(1,H-10,H-3,8,-4,6),'acero'],[CYL(1,H-10,H-3,-8,-4,6),'acero'],/* sombrerete */
        [CYL(5,0,6,0,-28,16).rotateX(Math.PI/2).translate(0,3,-6),'acero']/* toma de aire exterior por el piso */];return g;}},
    salExist:{n:'Salamandra existente (SAL-1)',sist:'leña',p:{kW:8,eta:65,on:'18:00',off:'24:00'},ui:[K,['eta','rendimiento %','num'],['on','prende','time'],['off','apaga','time']],
      /* sin forma propia: es la cápsula SAL-1 del modelo, con su tiraje. Potencia y rendimiento supuestos: corregilos con los datos reales */
      g:()=>[[B(-40,40,0,2,-40,40),'radiante']]},
    tiro:{n:'Calefactor de tiro balanceado',sist:'gas',p:{kW:3.5,eta:75},ui:[K,['eta','rendimiento %','num']],
      g:p=>{const w=40+p.kW*8;return [[B(-w/2,w/2,0,62,-11,11),'blanco'],[B(-w/2+6,w/2-6,8,50,11,11.4),'grafito'],[B(-w/2,w/2,62,64,-11,11),'grafito'],[CYL(6,30,36,0,-11,16).rotateX(Math.PI/2).translate(0,30,-14),'acero']];}},
    fancoil:{n:'Fancoil (de las calderas)',sist:'caldera',p:{kW:2.5},ui:[K],
      g:p=>{const w=60+p.kW*12;return [[B(-w/2,w/2,12,64,-11,11),'blanco'],[B(-w/2+5,w/2-5,56,62,11,11.3),'grafito'],[B(-w/2+4,-w/2+8,0,12,-8,8),'grafito'],[B(w/2-8,w/2-4,0,12,-8,8),'grafito']];}},
    radiante:{n:'Losa radiante (paño)',sist:'caldera',p:{L:400,D:300,Wm2:80},ui:[['L','largo','num'],['D','ancho','num'],['Wm2','W por m²','num']],
      g:p=>[[B(-p.L/2,p.L/2,.2,.8,-p.D/2,p.D/2),'radiante']]},
    caldera:{n:'Caldera (33.000 kcal/h)',sist:'fuente',p:{kW:38.4,eta:90},z:110,ui:[K,['eta','rendimiento %','num']],
      g:()=>[[B(-22,22,0,72,-17,15),'blanco'],[B(-20,20,8,14,15,15.4),'grafito'],[CYL(5,72,95,0,-2,16),'acero'],...[-12,-4,4,12].map(x=>[CYL(1.2,-20,0,x,0,8),'acero'])]},
  };
}
/* escenarios de partida por ambiente */
export function escCal(a,I){
  const N={nombre:'Sin calefacción',items:[]};
  switch(a){
    case 'living':return {A:{nombre:'Salamandra + losa radiante bajo la galería',items:[I('salExist',2043,638,0),I('radiante',1925,810,0,{L:1140,D:230,Wm2:80})]},
      B:{nombre:'Salamandra + losa + 2 fancoils',items:[I('salExist',2043,638,0),I('radiante',1925,810,0,{L:1140,D:230,Wm2:80}),I('fancoil',1360,200,90,{kW:3.5}),I('fancoil',2490,300,-90,{kW:3.5})]}};
    case 'cocina':return {A:{nombre:'Calderas (sin emisores)',items:[I('caldera',2015,-560,-90),I('caldera',2015,-505,-90)]},B:{nombre:'Calderas + fancoil',items:[I('caldera',2015,-560,-90),I('caldera',2015,-505,-90),I('fancoil',1940,-30,180,{kW:2.5})]}};
    case 'dorm1':return {A:N,B:{nombre:'Fancoil (plan)',items:[I('fancoil',60,400,90,{kW:3.5})]},C:{nombre:'Tiro balanceado',items:[I('tiro',60,400,90,{kW:3.5})]}};
    case 'dorm2':return {A:N,B:{nombre:'Fancoil (plan)',items:[I('fancoil',700,640,180,{kW:4})]},C:{nombre:'Tiro balanceado',items:[I('tiro',700,640,180,{kW:4})]}};
    case 'dorm3':return {A:N,B:{nombre:'Fancoil (plan)',items:[I('fancoil',2200,-740,0,{kW:2})]},C:{nombre:'Tiro balanceado',items:[I('tiro',2200,-740,0,{kW:3})]}};
    case 'dormS':return {A:N,B:{nombre:'Fancoil (plan)',items:[I('fancoil',60,560,90,{kW:3.5})]}};
    case 'dormP':return {A:N,B:{nombre:'Fancoil (plan)',items:[I('fancoil',800,40,0,{kW:3})]}};
    case 'banoEP':return {A:N,B:{nombre:'Fancoil',items:[I('fancoil',550,380,-90,{kW:1.5})]}};
    case 'estudio':return {A:N,B:{nombre:'Fancoil',items:[I('fancoil',1180,600,180,{kW:2})]}};
    case 'altillo':return {A:N,B:{nombre:'Fancoil (plan)',items:[I('fancoil',2103,-740,0,{kW:3.5})]}};
    default:return {A:N};
  }
}
