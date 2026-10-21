/* Equipamiento de Carhué: ambientes y escenarios de partida (muebles, luces, calefacción, plantas) y los arreglos que se corren una vez
   sobre lo guardado. El motor (motor/equipamiento.js) es el mismo para todas las casas; esto es lo propio de esta casa. */
export function equipCarhue({ it, itA, mover, SILLAS, MESA3, PISO }) {
  const R90=90;/* contra M-20 (cara interior x 1834,5), frente hacia el este */
  const xw=d=>1834.5+d/2;
  const H_EP=262;/* cara superior del piso del entrepiso */
  const AMB={
    cocina:{n:'Cocina',vista:{p:[2330,430,240],t:[1935,60,-280]},esc:()=>({
      A:{nombre:'Como está + isla',items:[/* Maxi 15/10: heladera contra el metro de pared al sur de la arcada (de espaldas a M-26); mesada a lo largo de la pared sur; isla adosada a la punta este de la mesada, grande, con las hornallas y banquetas del lado este. Las calderas van al sucucho del oeste (capa Calor). */
        it('heladera',1869.5,-299.5,0,{L:65,D:65,H:190,col:'rojo'}),it('mesada',xw(62),-81,R90,{L:362,D:62,fr:'verde',top:'granito'}),it('isla',2027,45,180,{L:260,D:110,vol:30,fr:'verde',top:'granito'}),it('anafe',2015,30,180,{L:75,D:52}),
        it('banqueta',1955,122,0),it('banqueta',2015,122,0),it('banqueta',2075,122,0),it('banqueta',2135,122,0)]},
      B:{nombre:'Lineal + isla',items:[it('heladera',xw(70),-560,R90,{L:70,D:70}),it('columna',xw(62),-495,R90,{L:60}),it('mesada',xw(62),-237.5,R90,{L:455,fr:'blanco',top:'granito'}),
        it('bacha',xw(62)+2,-242,R90,{L:80}),it('anafe',xw(62)+4,-400,R90,{L:60}),it('campana',xw(50),-400,R90,{L:60}),it('alacena',xw(35),-395,R90,{L:130},150),
        it('isla',2165,-175,-90,{L:200,D:95,vol:30,fr:'roble',top:'piedra'}),it('banqueta',2232,-240,0),it('banqueta',2232,-175,0),it('banqueta',2232,-110,0)]},
      C:{nombre:'Lineal + mesa de comer',items:[it('heladera',xw(70),-640,R90,{L:70,D:70}),it('columna',xw(62),-705,R90,{L:60}),it('mesada',xw(62),-292.5,R90,{L:555,fr:'grafito',top:'piedra'}),
        it('bacha',xw(62)+2,-242,R90,{L:80}),it('anafe',xw(62)+4,-470,R90,{L:60}),it('campana',xw(50),-470,R90,{L:60}),it('alacena',xw(35),-455,R90,{L:200},150),
        it('mesaR',2200,-170,0,{L:120}),it('silla',2200,-250,0),it('silla',2200,-90,180),it('silla',2120,-170,90),it('silla',2280,-170,-90)]},
    }),ocultar:['MES-1','HEL-1'],piso:PISO},
    living:{n:'Living',piso:PISO,vista:{p:[1650,520,1250],t:[1640,60,330]},esc:()=>{const I=itA('living');return {
      A:{nombre:'Frente al hogar',items:[I('alfombra',1700,300,0,{L:340,D:240}),I('sofaPlat',1712,470,180,{L:360,D:100,esq:1,Le:200,tela:'lino',mad:'roble'}),I('butaca',1465,280,90,{tela:'mostaza'}),I('ratona',1650,290,0,{L:120,D:60})]},
      B:{nombre:'Sofás enfrentados',items:[I('alfombra',1640,360,90,{L:300,D:220}),I('sofa',1480,360,90,{L:220,D:95,tela:'petroleo'}),I('sofa',1800,360,-90,{L:220,D:95,tela:'petroleo'}),I('ratona',1640,360,90,{L:110,D:60}),I('butaca',1640,560,180,{tela:'lino'})]},
      C:{nombre:'Mirando al jardín',items:[I('alfombra',1660,690,0,{L:340,D:220}),I('sofa',1660,600,0,{L:260,D:95,tela:'lino'}),I('ratona',1660,740,0,{L:130,D:60}),I('butaca',1460,760,90,{tela:'petroleo'}),I('butaca',1860,760,-90,{tela:'petroleo'}),I('butaca',1700,180,180,{tela:'mostaza'})]},
      D:{nombre:'Bajo y cálido (referencias)',items:[I('alfombraYute',1640,320,0,{L:300,D:220}),I('sofaPlat',1640,475,180,{L:280,D:100,tela:'lino',mad:'roble'}),I('ratonaTab',1640,310,0,{L:150,D:80,H:36}),I('taburete',1450,300,0),I('taburete',1830,300,0)]}};}},
    comedor:{n:'Comedor',piso:PISO,vista:{p:[2250,480,1150],t:[2250,60,380]},esc:()=>{const I=itA('comedor');const sillasRect=(cx,cy,L,D,n)=>{const r=[];for(let i=0;i<n;i++){const yy=cy-L/2+L*(i+.5)/n;r.push(I('silla',cx-D/2-22,yy,90),I('silla',cx+D/2+22,yy,-90));}r.push(I('silla',cx,cy-L/2-22,0),I('silla',cx,cy+L/2+22,180));return r;};
      const ronda=(cx,cy,R,n)=>[...Array(n)].map((_,i)=>{const a=i/n*Math.PI*2;return I('silla',cx+Math.sin(a)*R,cy+Math.cos(a)*R,Math.round((a*180/Math.PI+180)%360));});return {
      A:{nombre:'Mesa larga',items:[I('mesa',2250,430,90,{L:300,D:100}),...sillasRect(2250,430,300,100,4),I('aparador',2445,68,0,{L:150,D:45})]},
      B:{nombre:'Mesa redonda',items:[I('mesaR',2250,420,0,{L:140}),...ronda(2250,420,95,6),I('aparador',2445,68,0,{L:150,D:45})]},
      C:{nombre:'Mesa maciza (referencias)',items:[I('mesaMaciza',2250,430,90,{L:300,D:100}),...sillasRect(2250,430,300,100,4).map(s=>({...s,t:'sillaCurva',p:{}})),I('aparador',2445,68,0,{L:150,D:45})]}};}},
    galeriaV:{n:'Galería (bajo el techo de vidrio)',piso:PISO,vista:{p:[1700,330,420],t:[1700,60,900]},esc:()=>{const I=itA('galeriaV');return {
      /* Maxi 16/10: rincón cálido en la franja bajo T-04 (y 6,90–9,30, contra el ventanal), con el sillón mirando al jardín */
      A:{nombre:'Rincón cálido mirando al jardín',items:[I('alfombraYute',1700,815,0,{L:360,D:200}),I('sofaPlat',1700,758,0,{L:320,D:96,tela:'lino',mad:'roble'}),I('ratonaTab',1700,868,0,{L:140,D:56,H:34}),
        I('butaca',1450,830,90,{tela:'mostaza'}),I('butaca',1950,830,-90,{tela:'petroleo'}),I('taburete',1525,890,0),I('taburete',1875,890,0)]},
      B:{nombre:'Vacía',items:[]}};}},
    galeria:{n:'Galería (quincho)',piso:PISO,vista:{p:[3250,500,1350],t:[2746,60,500]},esc:()=>{const I=itA('galeria');const S=[];for(let i=0;i<4;i++){const yy=450-150+300*(i+.5)/4;S.push(I('silla',2746-50-22,yy,90),I('silla',2746+50+22,yy,-90));}return {
      A:{nombre:'Comedor afuera',items:[I('mesa',2746,450,90,{L:300,D:100}),...S,I('silla',2746,450-150-22,0),I('silla',2746,450+150+22,180)]},
      B:{nombre:'Estar afuera',items:[I('sofa',2746,250,0,{L:240,D:95,tela:'petroleo'}),I('butaca',2600,420,90,{tela:'lino'}),I('butaca',2892,420,-90,{tela:'lino'}),I('ratona',2746,410,0,{L:120,D:60}),I('reposera',2650,780,90),I('reposera',2650,870,90)]},
      C:{nombre:'Mesa + estar',items:[I('mesa',2746,700,90,{L:200,D:95}),I('banco',2746-48-25,700,90,{L:180}),I('banco',2746+48+25,700,-90,{L:180}),I('sofa',2746,200,0,{L:220,D:95,tela:'lino'}),I('ratona',2746,330,0,{L:110,D:55})]}};}},
    dorm1:{n:'Dormitorio 1 (PB)',piso:PISO,vista:{p:[210,520,1000],t:[210,40,360]},esc:()=>{const I=itA('dorm1');return {
      A:{nombre:'Cama contra el patio',items:[I('cama',210,143,0,{L:160,D:200}),I('mesaLuz',102,65,0),I('mesaLuz',318,65,0),I('placard',355,520,-90,{L:300,D:60}),I('escritorio',100,640,180,{L:120,D:60}),I('silla',100,585,0)]},
      B:{nombre:'Cama mirando al jardín',items:[I('cama',285,500,-90,{L:160,D:200}),I('mesaLuz',362,388,-90),I('mesaLuz',362,612,-90),I('placard',200,73,0,{L:300,D:60}),I('butaca',100,580,45,{tela:'petroleo'})]}};}},
    dorm2:{n:'Dormitorio 2 (PB)',piso:PISO,vista:{p:[860,520,1050],t:[860,40,500]},esc:()=>{const I=itA('dorm2');return {
      A:{nombre:'Matrimonial + escritorio',items:[I('cama',500,513,90,{L:160,D:200}),I('mesaLuz',425,395,90),I('mesaLuz',425,631,90),I('placard',600,385,0,{L:300,D:60}),I('escritorio',1100,570,180,{L:150,D:60}),I('silla',1100,515,0),I('butaca',1250,450,-90,{tela:'mostaza'})]},
      B:{nombre:'Dos camas + estar',items:[I('cama',495,430,90,{L:90,D:190}),I('cama',495,590,90,{L:90,D:190}),I('mesaLuz',425,510,90,{L:40}),I('placard',600,385,0,{L:300,D:60}),I('sofa',1150,555,180,{L:180,D:85,tela:'petroleo'}),I('ratona',1150,465,0,{L:100,D:50})]}};}},
    dorm3:{n:'Dormitorio 3 (ala)',piso:PISO,vista:{p:[2250,480,-250],t:[2200,40,-640]},esc:()=>{const I=itA('dorm3');return {
      A:{nombre:'Matrimonial',items:[I('cama',2230,-662,0,{L:140,D:190}),I('mesaLuz',2132,-737,0,{L:45}),I('mesaLuz',2328,-737,0,{L:45}),I('placard',2072,-680,90,{L:150,D:60})]},
      B:{nombre:'Simple + escritorio',items:[I('cama',2270,-700,-90,{L:90,D:190}),I('escritorio',2075,-680,90,{L:120,D:60}),I('silla',2130,-680,-90)]}};}},
    dormS:{n:'Dormitorio secundario (EP)',nivel:'EP',piso:H_EP,vista:{p:[220,640,980],t:[215,300,360]},esc:()=>{const I=itA('dormS');return {
      A:{nombre:'Cama a la pared del fondo',items:[I('cama',150,357,90,{L:140,D:190}),I('mesaLuz',58,257,90,{L:40}),I('mesaLuz',58,457,90,{L:40}),I('escritorio',363,600,-90,{L:120,D:60}),I('silla',310,600,90)]},
      B:{nombre:'Cama mirando al patio',items:[I('cama',215,590,180,{L:140,D:190}),I('mesaLuz',117,665,180,{L:40}),I('mesaLuz',313,665,180,{L:40}),I('comoda',368,250,-90,{L:120,D:50}),I('butaca',100,160,135,{tela:'lino'})]}};}},
    dormP:{n:'Dormitorio principal (EP)',nivel:'EP',piso:H_EP,vista:{p:[800,680,1000],t:[800,300,360]},esc:()=>{const I=itA('dormP');return {
      A:{nombre:'Cama a M-41',items:[I('cama',675,360,90,{L:180,D:200}),I('mesaLuz',600,242,90),I('mesaLuz',600,478,90),I('comoda',900,57,0,{L:140,D:50}),I('butaca',940,580,-135,{tela:'mostaza'})]},
      B:{nombre:'Cama al pasillo',items:[I('cama',800,127,0,{L:180,D:200}),I('mesaLuz',682,50,0),I('mesaLuz',918,50,0),I('escritorio',605,620,90,{L:120,D:60}),I('silla',660,620,-90),I('butaca',960,500,-90,{tela:'lino'})]}};}},
    banoEP:{n:'Baño + vestidor (EP, L-26)',nivel:'EP',piso:H_EP,vista:{p:[485,435,40],t:[485,330,520]},esc:()=>{const I=itA('banoEP');return {
      /* L-26: 1,60 libre entre M-40 (x 4,00) y M-41 (x 5,70), 6,65 de largo. Alto libre: 2,24 junto al pasillo, 2,43 en la cumbrera (y 3,40),
         2,05 en y 4,50, 1,57 en y 5,60, 1,06 contra la fachada; sobre x 5,06–5,65 entre y 4,23 y 7,41 está la lucarna LU-2 (alto de sobra).
         Lo que exige estar parado va en el tramo alto o bajo la lucarna; la bañera (se usa acostado) al fondo bajo el techo, frente a la ventana baja VE-2. */
      A:{nombre:'Vestidor + baño con bañera bajo el techo',items:[I('placard',435,160,90,{L:260,D:60,H:215}),I('biblioteca',550,200,-90,{L:180,D:30,H:200}),
        I('vanitorio',430,385,90,{L:110,D:50}),I('inodoro',433,485,90),I('ducha',515,495,-90,{L:75,D:100,H:200}),I('banera',486,645,180,{L:156,D:75})]},
      B:{nombre:'Baño grande, vanitorio doble (sin vestidor)',items:[I('vanitorio',430,200,90,{L:160,D:50}),I('inodoro',433,330,90),I('bidet',433,400,90),I('ducha',527,500,-90,{L:75,D:150,H:200}),I('banera',486,645,180,{L:156,D:75}),I('biblioteca',550,200,-90,{L:120,D:30,H:180})]},
      C:{nombre:'Vestidor grande + baño compacto',items:[I('placard',435,200,90,{L:340,D:60,H:215}),I('biblioteca',550,240,-90,{L:260,D:30,H:200}),I('vanitorio',430,425,90,{L:80,D:45}),I('inodoro',433,515,90),I('ducha',527,500,-90,{L:75,D:110,H:200}),I('banco',486,650,0,{L:150,D:38,H:40})]}};}},
    estudio:{n:'Estudio (EP)',nivel:'EP',piso:H_EP,vista:{p:[1750,620,760],t:[1200,330,300]},esc:()=>{const I=itA('estudio');return {
      /* L-27, entre la corrediza M-43 (x 10,27) y el balcón al living (x 14,42); el hueco de la escalera ocupa x 13,18–14,42, y 4,11–6,25. Maxi 14/10: es un escritorio. Pasando x 13,22 el techo del living (T-03) baja a menos de 1 m: el escritorio va antes */
      A:{nombre:'Escritorio mirando al living',items:[I('escritorio',1280,190,-90,{L:180,D:70}),I('silla',1215,190,90),I('placard',1062,102,90,{L:150,D:60,H:200,fr:'roble'}),I('butaca',1110,520,45,{tela:'mostaza'}),I('ratona',1190,560,0,{L:50,D:50,H:45}),I('alfombra',1180,300,0,{L:200,D:260})]},
      B:{nombre:'Dos puestos enfrentados',items:[I('escritorio',1230,190,0,{L:160,D:70}),I('escritorio',1230,260,180,{L:160,D:70}),I('silla',1230,130,0),I('silla',1230,320,180),I('placard',1062,102,90,{L:150,D:60,H:200,fr:'roble'}),I('butaca',1250,520,180,{tela:'petroleo'})]},
      C:{nombre:'Escritorio largo mirando al living',items:[I('escritorio',1285,215,-90,{L:300,D:60}),I('silla',1225,140,90),I('silla',1225,290,90),I('placard',1062,102,90,{L:150,D:60,H:200,fr:'roble'}),I('sofa',1170,540,0,{L:180,D:85,tela:'lino'})]}};}},
    altillo:{n:'Altillo (EP)',nivel:'EP',piso:H_EP,vista:{p:[2550,700,-300],t:[2100,300,-560]},esc:()=>{const I=itA('altillo');return {
      /* el techo baja hacia x 1835 y x 2365 (cumbrera en x ≈ 2103, sobre P-34): alto libre: 2,25 en la cumbrera, 1,60 a 1 m de ella, bajo los cabios 0,49 a 30 cm de la pared, así que los pies quedan a 0,72 de la pared (Maxi 14/10: tocaban los cabios); las camas van de través con la cabecera hacia el centro (la cabeza bajo lo alto, los pies hacia el alero; Maxi 14/10) y la cucheta (1,65) sólo entra bajo la cumbrera, a lo largo (Maxi 14/10: cuarto de chicos; queen como opción) */
      A:{nombre:'Cuatro camas single, cabeceras al centro',items:[I('cama',1980,-690,-90,{L:90,D:190}),I('cama',1980,-480,-90,{L:90,D:190}),I('cama',2226,-690,90,{L:90,D:190}),I('cama',2226,-480,90,{L:90,D:190}),I('alfombra',2103,-560,90,{L:240,D:110}),I('comoda',2103,-390,180,{L:100,D:45})]},
      C:{nombre:'Cucheta bajo la cumbrera + dos single + juego',items:[I('cucheta',2103,-662,0,{L:90,D:190}),I('cama',1980,-700,-90,{L:90,D:190}),I('cama',2226,-700,90,{L:90,D:190}),I('alfombra',2103,-450,0,{L:220,D:150}),I('banco',1900,-440,90,{L:150,D:38,H:40}),I('biblioteca',2310,-440,-90,{L:150,D:30,H:80})]},
      J:{nombre:'Seis camas single (tres por lado)',items:[I('cama',1980,-705,-90,{L:90,D:190}),I('cama',1980,-597,-90,{L:90,D:190}),I('cama',1980,-489,-90,{L:90,D:190}),I('cama',2226,-705,90,{L:90,D:190}),I('cama',2226,-597,90,{L:90,D:190}),I('cama',2226,-489,90,{L:90,D:190})]},
      Q:{nombre:'Cama queen',items:[I('cama',2103,-657,0,{L:160,D:200}),I('mesaLuz',1993,-737,0),I('mesaLuz',2213,-737,0),I('comoda',2300,-450,-90,{L:120,D:50,H:60})]},
      B:{nombre:'Dos camas',items:[I('cama',1960,-662,0,{L:90,D:190}),I('cama',2240,-662,0,{L:90,D:190}),I('mesaLuz',2100,-737,0,{L:45}),I('comoda',1906,-500,90,{L:120,D:50,H:60})]}};}},
  };
  AMB.exterior={n:'Exterior (jardín y pileta)',piso:0,vista:{p:[3350,900,2300],t:[3000,0,600]},esc:()=>{const I=itA('exterior');return {A:{nombre:'Reposeras en el deck',items:[...[480,580,760,860,1040].map(y=>I('reposera',3150,y,90)),I('reposera',2877,1340,90,{},25),I('reposera',2877,1440,90,{},25),I('ratona',3150,670,0,{L:50,D:50,H:40}),I('ratona',3150,950,0,{L:50,D:50,H:40})]},B:{nombre:'Sin muebles',items:[]}};}};
  const AMB_ORDEN=['cocina','comedor','living','galeriaV','galeria','dorm1','dorm2','dorm3','dormS','dormP','banoEP','estudio','altillo','exterior'];
  const ESP_B=['Bush 1','Bush 2','Bush 3'];/* arbustos del catálogo de plantas del motor */
  function escVeg(){const I=itA('V');const it=[I('arbol',2924,37,34,{esp:'Oak Large',alto:1600,seed:3})];
    /* filas de árboles del fondo y del sur (antes ARB-1 / ARB-2), con arbustos entre medio */
    const fila=(a,b,n,nb)=>{const P=[['Ash Large',1],['Oak Medium',2],['Ash Medium',3],['Oak Medium',4]];for(let i=0;i<n;i++){const t=(i+.5)/n,x=a[0]+(b[0]-a[0])*t+((i*37)%11-5)*20,y=a[1]+(b[1]-a[1])*t+((i*53)%13-6)*25;const [pr,sd]=P[(i*5)%4];it.push(I('arbol',x,y,Math.round((i*137)%360),{esp:pr,seed:sd,alto:1000+((i*7)%9)*70}));}
      for(let i=0;i<nb;i++){const t=(i+.5)/nb,k=((i*104729)%89)/89;it.push(I('arbusto',a[0]+(b[0]-a[0])*t+(k-.5)*200,a[1]+(b[1]-a[1])*t+(k-.5)*200,(i*97)%360,{esp:ESP_B[i%3],seed:1+i%3,alto:130+Math.round(((i*7919)%97)/97*120)}));}};
    fila([-900,-2950],[4200,-2850],14,22);fila([-3150,-3000],[-3150,3600],14,26);
    /* jardín: árboles sueltos */
    for(const [x,y,e,s,h] of [[-1600,1600,'Ash Large',1,1300],[-700,2700,'Oak Large',2,1500],[300,3200,'Aspen Medium',3,1100],[1300,2700,'Oak Medium',4,1150],[2400,3300,'Ash Medium',2,1050],[3300,2600,'Aspen Medium',1,1000],[4300,3200,'Oak Medium',3,1200],[-2500,400,'Ash Medium',4,1100],[-2700,2300,'Oak Medium',1,1250]])it.push(I('arbol',x,y,(x*7)%360,{esp:e,seed:s,alto:h}));
    /* arbustos contra la fachada del jardín (entre puertas) y matas bajas al borde del deck */
    for(const x of [60,160,450,550,850,940])it.push(I('arbusto',x,790,(x*3)%360,{esp:x%3?'Bush 1':'Bush 2',seed:1+x%4,alto:150+(x%5)*12}));
    for(let x=1400;x<=2500;x+=110)it.push(I('bajo',x,1195,(x*5)%360,{esp:'Bush 3',seed:1+(x/110)%4,alto:45+(x%3)*8}));
    for(let y=300;y<=1700;y+=130)it.push(I('bajo',4600,y,(y*3)%360,{esp:'Bush 2',seed:1+(y/130)%4,alto:60}));
    return {A:{nombre:'Jardín',items:it},B:{nombre:'Sin plantas',items:[]}};}
  const MOD3D={living:items=>{for(let i=0;i<items.length;i++){const m=items[i];
      if(m.t==='sofaPlat'&&+(m.p&&m.p.esq)){const n={...m,t:'sofaLcb',p:{L:360,D:182,H:76,lado:'izq'}};mover(n,41);items[i]=n;}/* misma espalda y misma chaise (−x local) que la L de tarima */
      else if(m.t==='butaca')items[i]={...m,t:'butacaAm',p:{tela:'tela'}};
      else if(m.t==='ratona'&&Math.abs(m.x-1650)<12&&Math.abs(m.y-290)<12)items[i]={...m,t:'ratonaJoco',y:325,p:{L:150,D:120,H:32}};}},
    galeriaV:items=>{for(let i=0;i<items.length;i++){const m=items[i];
      if(m.t==='sofaPlat'){const n={...m,t:'sofaRaffey',p:{L:(m.p&&m.p.L)||300,D:96,H:82}};mover(n,(96-((m.p&&m.p.D)||100))/2);items[i]=n;}/* la espalda queda donde estaba; la franja tiene 2,25 entre la pared y el ventanal */
      else if(m.t==='butaca')items[i]={...m,t:'butacaAm',p:{tela:'tela'}};
      else if(m.t==='ratonaTab')items[i]={...m,t:'ratonaJoco',y:868,p:{L:84,D:64,H:30}};}},
    comedor:items=>SILLAS(items,'sillaCover'),galeria:items=>SILLAS(items,'sillaDSW')};
  /* agregados posteriores (Maxi 14/10): se suman una vez al escenario activo guardado, para que aparezcan aunque ya hubiera algo guardado */
  const MIG={luz:{exterior:[['reflectores200',()=>[{t:'reflector',x:2955,y:480,r:90,p:{tilt:12,beam:60}},{t:'reflector',x:2746,y:946,r:0,p:{tilt:15,beam:90}}]],['reflectoresDorm',()=>[{t:'reflector',x:22,y:732,r:20,p:{tilt:22,beam:90,z:318}},{t:'reflector',x:972,y:732,r:-20,p:{tilt:22,beam:90,z:318}}]]],
    living:[['galponeras',()=>[{t:'galponera',x:1540,y:352,r:0,p:{}},{t:'galponera',x:1740,y:352,r:0,p:{}}]]]}};
  const MUT_CAL=[['salExistente',items=>{for(let i=items.length-1;i>=0;i--){const m=items[i];if(m.t==='salamandra'&&Math.hypot(m.x-1960,m.y-600)<150)items.splice(i,1);}if(!items.some(m=>m.t==='salExist'))items.unshift({id:'Csal'+Date.now().toString(36),t:'salExist',x:2043,y:638,r:0,p:{}});}]];/* Maxi 14/10: la salamandra ya existe (SAL-1); la diseñada queda en el catálogo */
  const MUT_MUE={cocina:[['islaAdosada',items=>{const A=items.some(m=>m.t==='desayunador');if(!A)return;for(let i=items.length-1;i>=0;i--){const m=items[i];if(m.t==='desayunador'||(m.t==='banqueta'&&Math.abs(m.y-122)<3))items.splice(i,1);}
      const h=items.find(m=>m.t==='heladera');if(h){h.x=1869.5;h.y=-299.5;h.r=0;}const me=items.find(m=>m.t==='mesada');if(me){me.y=-81;me.p={...me.p,L:362};}const id=()=>'misla'+Math.random().toString(36).slice(2,8);
      items.push({id:id(),t:'isla',x:2027,y:45,r:180,p:{L:260,D:110,vol:30,fr:'verde',top:'granito'}},{id:id(),t:'anafe',x:2015,y:30,r:180,p:{L:75,D:52}},...[1955,2015,2075,2135].map(x=>({id:id(),t:'banqueta',x,y:122,r:0,p:{}})));}],['desayunador',items=>{/* la versión «como está» guardada: misma reubicación que en fábrica */const h=items.find(m=>m.t==='heladera'&&Math.abs(m.y+301.5)<5),me=items.find(m=>m.t==='mesada'&&Math.abs(m.y+83)<5&&(m.p?.L??0)===366);if(!h||!me)return;h.y=-207;me.y=-36;me.p={...me.p,L:272};
      if(!items.some(m=>m.t==='desayunador')){const id=()=>'mdes'+Math.random().toString(36).slice(2,8);items.push({id:id(),t:'desayunador',x:1972,y:75,r:0,p:{L:150,D:50}},{id:id(),t:'banqueta',x:1930,y:122,r:0,p:{}},{id:id(),t:'banqueta',x:1985,y:122,r:0,p:{}},{id:id(),t:'banqueta',x:2040,y:122,r:0,p:{}});}}],['islaAdosada2',/* Maxi 16/10: la isla no había aparecido porque «desayunador» corría después de «islaAdosada»; se vuelve a aplicar */items=>{const A=items.some(m=>m.t==='desayunador');if(!A)return;for(let i=items.length-1;i>=0;i--){const m=items[i];if(m.t==='desayunador'||(m.t==='banqueta'&&Math.abs(m.y-122)<3))items.splice(i,1);}
      const h=items.find(m=>m.t==='heladera');if(h){h.x=1869.5;h.y=-299.5;h.r=0;}const me=items.find(m=>m.t==='mesada');if(me){me.y=-81;me.p={...me.p,L:362};}const id=()=>'misla'+Math.random().toString(36).slice(2,8);
      items.push({id:id(),t:'isla',x:2027,y:45,r:180,p:{L:260,D:110,vol:30,fr:'verde',top:'granito'}},{id:id(),t:'anafe',x:2015,y:30,r:180,p:{L:75,D:52}},...[1955,2015,2075,2135].map(x=>({id:id(),t:'banqueta',x,y:122,r:0,p:{}})));}]],altillo:[['comodaFueraCamas',items=>{for(const m of items)if(m.t==='comoda'&&Math.abs(m.x-2103)<4&&Math.abs(m.y+730)<4){m.y=-390;m.r=180;}}],['comodasBajas',items=>{for(const m of items)if(m.t==='comoda'){if(Math.abs(m.x-2340)<6){m.x=2300;m.p={...(m.p||{}),H:60};}else if(Math.abs(m.x-1862)<6){m.x=1906;m.p={...(m.p||{}),H:60};}}}],['camasCentro',items=>{for(const m of items)if(m.t==='cama'&&(m.r===-90||m.r===90||m.r===270)){if(Math.abs(m.x-1955)<6)m.x=1980;else if(Math.abs(m.x-2251)<6)m.x=2226;}}]],
    dormS:[['camaChimenea',items=>{for(const m of items)if(m.t==='cama'&&Math.abs(m.x-130)<4&&Math.abs(m.y-357)<4)m.x=150;}]],
    banoEP:[['duchaEntreMuros',items=>{for(const m of items)if(m.t==='ducha'&&Math.abs(m.x-527)<4&&Math.abs(m.y-495)<4){m.x=515;m.p={...(m.p||{}),D:100};}}]],
    dorm2:[['placardMesaLuz',items=>{for(const m of items)if(m.t==='placard'&&Math.abs(m.x-580)<4&&Math.abs(m.y-385)<4)m.x=600;}]],
    comedor:[['mesa3m',items=>MESA3(items)]],galeria:[['mesa3m',items=>MESA3(items)]],
    living:[['sofaL',items=>{/* Maxi 16/10: el sillón frente al hogar, en L y de 4–5 cuerpos */for(let i=0;i<items.length;i++){const m=items[i];if((m.t==='sofa'||m.t==='sofaPlat')&&((m.r||0)+360)%360===180&&m.y>400&&m.y<540&&m.x>1450&&m.x<1800)items[i]={...m,t:'sofaPlat',x:1712,y:470,/* al este de la escalera (x 15,15) */r:180,p:{L:360,D:100,esq:1,Le:200,tela:'lino',mad:'roble'}};}for(let i=items.length-1;i>=0;i--){const m=items[i];if(m.t==='ratona'&&Math.abs(m.x-1640)<10&&Math.abs(m.y-290)<10)m.x=1650;if(m.t==='alfombra'&&Math.abs(m.x-1640)<10&&Math.abs(m.y-300)<10){m.x=1700;m.p={...(m.p||{}),L:340};}if(m.t==='butaca'&&Math.abs(m.x-1815)<10&&Math.abs(m.y-280)<10)items.splice(i,1);}}]],
    estudio:[['armarioCorrediza',items=>{/* Maxi 15/10: la biblioteca tapaba la salida al pasillo; va un armario contra el tramo fijo de M-43 */for(let i=items.length-1;i>=0;i--){const m=items[i];if(m.t==='biblioteca'&&Math.abs(m.x-1180)<8&&Math.abs(m.y-42)<8)items.splice(i,1,{...m,t:'placard',x:1062,y:102,r:90,p:{L:150,D:60,H:200,fr:'roble'}});}}],['escritorioBajoAlto',items=>{for(const m of items){if(m.t==='escritorio'&&Math.abs(m.x-1370)<6)m.x=1280;else if(m.t==='escritorio'&&Math.abs(m.x-1395)<6)m.x=1285;else if(m.t==='silla'&&Math.abs(m.x-1305)<6)m.x=1215;else if(m.t==='silla'&&Math.abs(m.x-1340)<6)m.x=1225;}}]]};
  for(const [a,fn] of Object.entries(MOD3D))(MUT_MUE[a]=MUT_MUE[a]||[]).push(['modelos3d',fn]);
  const MUT={mue:MUT_MUE,cal:{living:MUT_CAL,cocina:[['calderas33',items=>{for(const m of items)if(m.t==='caldera'){m.p={...(m.p||{}),kW:38.4};}}],['calderasSucucho',items=>{/* Maxi 15/10: van al sucucho del extremo oeste (L-09), en la pared sur */for(const m of items)if(m.t==='caldera'&&Math.abs(m.x-1852)<5){if(Math.abs(m.y+310)<5)m.y=-730;else if(Math.abs(m.y+264)<5)m.y=-684;}}],['calderasSur',items=>{/* Maxi 15/10: van contra la pared sur, donde estaba la heladera */for(const m of items)if(m.t==='caldera'&&Math.abs(m.x-2015)<5){if(Math.abs(m.y+560)<5){m.x=1852;m.y=-310;m.r=90;}else if(Math.abs(m.y+505)<5){m.x=1852;m.y=-264;m.r=90;}}}]]},/* Maxi 14/10: calderas de 33.000 kcal/h */luz:{dormP:[['pieBajoAlto',items=>{for(const m of items)if(m.t==='pie'&&Math.abs(m.x-940)<6&&Math.abs(m.y-620)<6){m.x=990;m.y=455;}}]],estudio:[['linealBajoAlto',items=>{for(const m of items){if(m.t==='linea'&&Math.abs(m.x-1370)<6)m.x=1280;if(m.t==='velador'&&Math.abs(m.x-1400)<6&&Math.abs(m.y-110)<6){m.x=1290;m.y=115;}}}]],exterior:[['reflEsquinaSur',items=>{/* con el dormer corrido la ventana empieza en x 0,50: el reflector va en la esquina maciza */for(const m of items)if(m.t==='reflector'&&Math.abs(m.y-732)<30&&Math.abs(m.x-45)<15)m.x=22;}],['reflBajoTecho',items=>{for(const m of items){if(m.t!=='reflector')continue;if(Math.abs(m.x-2945)<30&&Math.abs(m.y-352)<30&&(m.p?.z??0)>480)m.p={...m.p,z:478};if(Math.abs(m.x-2746)<30&&Math.abs(m.y-946)<30&&((m.p?.z)??280)>222)m.p={...(m.p||{}),z:222};}}],['reflBajoAlero',items=>{for(const m of items)if(m.t==='reflector'&&Math.abs(m.y-732)<30&&(Math.abs(m.x-45)<40||Math.abs(m.x-972)<40)){m.p={...(m.p||{}),z:318};}}],['reflAleroPuntas',items=>{for(const m of items)if(m.t==='reflector'&&Math.abs(m.y-732)<30){if(Math.abs(m.x-250)<40){m.x=45;m.r=20;}else if(Math.abs(m.x-800)<40){m.x=972;m.r=-20;}}}],['reflCumbrera',items=>{for(const m of items)if(m.t==='reflector'&&Math.abs(m.x-2955)<40&&Math.abs(m.y-480)<40){m.x=2945;m.y=352;m.r=62;m.p={...(m.p||{}),z:515,tilt:22,beam:60};}}]]}};/* Maxi 14/10: el de la pileta va en la cumbrera, en la punta del quincho */
  /* luces y calefacción de partida por ambiente */
  function escLuces(a,I){
  const R90=90;
  switch(a){
    case 'cocina':return {
      A:{nombre:'Riel + tira bajo alacena',items:[I('riel',1905,-150,R90,{n:4,L:300,tilt:20}),I('tira',1866,-150,R90,{L:300,z:148,dir:'abajo'}),I('colgante',2165,-175,0,{drop:85,diam:30})]},
      B:{nombre:'Embutidos + colgantes sobre isla',items:[I('emb',1910,-300,R90,{n:4,sep:110}),I('colgante',2165,-245,0,{drop:80,diam:25}),I('colgante',2165,-175,0,{drop:80,diam:25}),I('colgante',2165,-105,0,{drop:80,diam:25})]}};
    case 'comedor':return {
      A:{nombre:'Lineal sobre la mesa',items:[I('linea',2250,430,R90,{L:160,drop:85}),I('aplique',2445,92,0,{z:190})]},
      B:{nombre:'Colgante grande + bañadores',items:[I('colgante',2250,420,0,{drop:95,diam:55,lm:1400}),I('riel',2250,180,0,{n:3,L:200,tilt:25})]}};
    case 'living':return {
      A:{nombre:'Lámparas bajas',items:[I('galponera',1540,352,0),I('galponera',1740,352,0),I('pie',1480,480,0),I('velador',1815,350,0,{z:0,lm:350}),I('riel',1640,250,0,{n:4,L:250,tilt:30})]},
      B:{nombre:'Spots en cuadro + tira en cornisa',items:[I('galponera',1540,352,0),I('galponera',1740,352,0),I('cuadro',1640,330,0,{sep:160}),I('pie',1460,560,0),I('tira',1640,175,0,{L:300,z:235,dir:'arriba'})]}};
    case 'galeria':return {
      A:{nombre:'Guirnalda + lineal',items:[I('guirnalda',2746,450,R90,{L:700,z:255}),I('linea',2746,450,R90,{L:200,drop:70,lm:3000})]},
      B:{nombre:'Embutidos',items:[I('emb',2746,300,R90,{n:3,sep:150}),I('emb',2746,650,R90,{n:3,sep:150})]}};
    case 'dorm1':return {A:{nombre:'Plafón + veladores',items:[I('plafon',210,330,0),I('velador',102,65,0),I('velador',318,65,0)]}};
    case 'dorm2':return {A:{nombre:'Plafón + veladores',items:[I('plafon',700,500,0),I('velador',425,395,90),I('velador',425,631,90)]}};
    case 'dorm3':return {A:{nombre:'Plafón + veladores',items:[I('plafon',2220,-600,0),I('velador',2132,-737,0),I('velador',2328,-737,0)]}};
    case 'dormS':return {A:{nombre:'Veladores',items:[I('velador',58,257,90),I('velador',58,457,90),I('aplique',380,600,-90,{z:170})]}};
    case 'dormP':return {A:{nombre:'Veladores + aplique',items:[I('velador',600,242,90),I('velador',600,478,90),I('pie',990,455,0)]}};
    case 'banoEP':return {A:{nombre:'Embutidos + tira en el espejo',items:[I('emb',485,160,0,{n:2,sep:140,lm:450}),I('emb',485,420,90,{n:2,sep:110,lm:500,K:3000}),I('tira',407,385,90,{L:110,z:190,dir:'frente',lmm:800,K:3000}),I('aplique',485,686,180,{z:150,lm:250,K:2700})]}};
    case 'estudio':return {A:{nombre:'Lineal sobre el escritorio + lectura',items:[I('linea',1280,190,90,{L:150,drop:70,lm:2200,K:4000}),I('velador',1290,115,0,{z:75,lm:400}),I('pie',1060,560,0),I('emb',1180,330,90,{n:2,sep:120,lm:500})]}};
    case 'altillo':return {A:{nombre:'Colgante en la cumbrera + tira',items:[I('colgante',2103,-560,0,{drop:40,diam:35,lm:1200}),I('tira',2103,-748,0,{L:200,z:120,dir:'arriba',lmm:500})]}};
    case 'exterior':return {
      A:{nombre:'Árbol + balizas + pileta',items:[I('reflector',22,732,20,{tilt:22,beam:90,z:318}),I('reflector',972,732,-20,{tilt:22,beam:90,z:318}),I('reflector',2945,352,62,{tilt:22,beam:60,z:478}),I('reflector',2746,946,0,{tilt:15,beam:90,z:222}),I('proyector',2860,110,-60,{tilt:12,lm:2000}),I('proyector',2985,-20,120,{tilt:12,lm:1500}),
        ...[1500,1800,2100,2400].map(x=>I('baliza',x,1135,0)),I('pileta',3332,700,R90,{z:-45}),I('pileta',3332,1250,R90,{z:-45})]},
      B:{nombre:'Sólo pileta',items:[I('reflector',22,732,20,{tilt:22,beam:90,z:318}),I('reflector',972,732,-20,{tilt:22,beam:90,z:318}),I('reflector',2945,352,62,{tilt:22,beam:60,z:478}),I('reflector',2746,946,0,{tilt:15,beam:90,z:222}),I('pileta',3332,700,R90,{z:-45}),I('pileta',3332,1250,R90,{z:-45})]}};
    default:return {A:{nombre:'Sin luces',items:[]}};
  }
}
  function escCal(a,I){
  const N={nombre:'Sin calefacción',items:[]};
  switch(a){
    case 'living':return {A:{nombre:'Salamandra + losa radiante bajo la galería',items:[I('salExist',2043,638,0),I('radiante',1925,810,0,{L:1140,D:230,Wm2:80})]},
      B:{nombre:'Salamandra + losa + 2 fancoils',items:[I('salExist',2043,638,0),I('radiante',1925,810,0,{L:1140,D:230,Wm2:80}),I('fancoil',1360,200,90,{kW:3.5}),I('fancoil',2490,300,-90,{kW:3.5})]}};
    case 'cocina':return {A:{nombre:'Calderas (sin emisores)',items:[I('caldera',1852,-730,90),I('caldera',1852,-684,90)]},B:{nombre:'Calderas + fancoil',items:[I('caldera',1852,-730,90),I('caldera',1852,-684,90),I('fancoil',1940,-30,180,{kW:2.5})]},
      C:{nombre:'Calderas afuera, en gabinete de chapa',items:[/* del lado del patio, contra M-21, detrás del sucucho */I('gabinete',1890,-822,180,{L:130,D:55,H:210}),I('caldera',1862,-815,180),I('caldera',1918,-815,180)]}};
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
  const alMezclar=(a,k,s,migrar)=>{if(k==='mue'&&a==='cocina'&&!s.migr.includes('islaActiva')&&s.esc.A){s.migr.push('islaActiva');s.activo='A';migrar.push([a,k]);}/* Maxi 16/10: «¿desapareció la isla?»: queda a la vista el escenario con la isla */};
  return { inicial: 'cocina', AMB, orden: AMB_ORDEN, veg: escVeg, mod3d: MOD3D, mig: MIG, mut: MUT, luces: escLuces, cal: escCal, alMezclar };
}
