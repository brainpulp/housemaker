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
    gabinete:{n:'Gabinete de chapa (intemperie)',sist:'nada',p:{L:130,D:55,H:210},ui:[['L','ancho','num'],['D','fondo','num'],['H','alto','num']],
      g:p=>[[B(-p.L/2,p.L/2,0,4,-p.D/2,p.D/2),'grafito'],[B(-p.L/2,-p.L/2+1.2,4,p.H,-p.D/2,p.D/2),'grafito'],[B(p.L/2-1.2,p.L/2,4,p.H,-p.D/2,p.D/2),'grafito'],[B(-p.L/2,p.L/2,4,p.H,-p.D/2,-p.D/2+1.2),'grafito'],[B(-p.L/2-3,p.L/2+3,p.H,p.H+2,-p.D/2-3,p.D/2+5),'grafito'],
        [B(-p.L/2,-1,8,p.H-4,p.D/2-1.2,p.D/2),'grafito'],[B(1,p.L/2,8,p.H-4,p.D/2-1.2,p.D/2),'grafito'],[B(-12,-8,p.H*.5-10,p.H*.5+10,p.D/2,p.D/2+1.5),'acero'],[B(8,12,p.H*.5-10,p.H*.5+10,p.D/2,p.D/2+1.5),'acero'],
        ...[0,1,2,3].map(i=>[B(-p.L/2+10,p.L/2-10,p.H-30+i*5,p.H-28+i*5,p.D/2,p.D/2+.8),'negro'])]},/* puertas dobles con rejillas de ventilación arriba */
    caldera:{n:'Caldera (33.000 kcal/h)',sist:'fuente',p:{kW:38.4,eta:90},z:110,ui:[K,['eta','rendimiento %','num']],
      g:()=>[[B(-22,22,0,72,-17,15),'blanco'],[B(-20,20,8,14,15,15.4),'grafito'],[CYL(5,72,95,0,-2,16),'acero'],...[-12,-4,4,12].map(x=>[CYL(1.2,-20,0,x,0,8),'acero'])]},
  };
}
/* escenarios de partida por ambiente */
