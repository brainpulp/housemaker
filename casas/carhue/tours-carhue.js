/* Tours de Carhué: caminatas y vuelos de dron, y qué piezas son las pedadas de cada escalera. El motor (motor/tours.js) es el mismo para todas las casas. */
export const TOURS_CARHUE = (() => {
  return [
    {id:'patio-cocina',n:'Caminata: del patio al living y la cocina',tipo:'walk',seg:[
      {walk:[[1409,-330],[1409,-60],[1409,30],[1420,170]],lvl:0},{look:[2000,170,700],t:2.5},
      {walk:[[1600,420],[1880,780]],lvl:0},{look:[1950,160,1500],t:2.5},
      {walk:[[2150,560],[2150,250],[1950,70],[1935,-120]],lvl:0},{look:[1866,120,-170],t:2},{walk:[[1935,-420]],lvl:0},{look:[1935,150,-700],t:1.5}]},
    {id:'entrepiso',n:'Caminata: subir al entrepiso',tipo:'walk',seg:[
      {walk:[[1900,420],[1650,560]],lvl:0},{stair:'ep'},{look:[2000,150,450],t:2.5},{walk:[[1250,330],[1120,250]],lvl:262},{look:[750,170,350],t:2}]},
    {id:'altillo',n:'Caminata: subir al altillo',tipo:'walk',seg:[
      {walk:[[1950,250],[2050,-30],[2250,-60]],lvl:0},{stair:'alt'},{walk:[[2103,-310],[2103,-420],[2100,-560]],lvl:262},{look:[1900,330,-700],t:2},{look:[2300,330,-450],t:2}]},
    {id:'jardin-pileta',n:'Caminata: jardín, quincho y pileta',tipo:'walk',seg:[
      {walk:[[1500,1070]],lvl:0},{look:[1750,250,500],t:2.5},{walk:[[2300,1080],[2700,760]],lvl:0},{look:[2746,230,250],t:2},
      {walk:[[2990,640],[2797,90]],lvl:0},{stair:'pil2'},{walk:[[3267,110],[3453,140]],lvl:100},{look:[3453,0,1300],t:3}]},
    {id:'dron-vuelta',n:'Dron: vuelta alrededor de la casa',tipo:'orbit',c:[1550,150,150],r:2700,h:950,dur:42,a0:0},
    {id:'dron-jardin',n:'Dron: del jardín, por arriba del techo, a la pileta',tipo:'fly',dur:34,k:[
      [[700,170,2500],[700,140,690]],[[1500,300,1800],[1650,200,700]],[[2050,950,1150],[2050,250,300]],[[2900,1150,200],[2817,0,700]],[[3017,520,-250],[3417,40,700]],[[3457,260,-300],[3457,60,1000]]]},
    {id:'dron-ventanal',n:'Dron: entra por el ventanal al living',tipo:'fly',dur:26,k:[
      [[1900,260,2700],[1900,200,900]],[[1900,220,1300],[1900,200,600]],[[1880,200,860],[1700,240,300]],[[1800,430,520],[1200,320,400]],[[1650,480,260],[2000,120,-250]]]},
  ];
})();
export const ESCALERAS_CARHUE = (() => {
  return {ep:p=>/^(ESC1-T|ESC-(ZE\d|TE|E\d|P\d|T\d|H\d|L\d))$/.test(p.id)&&(p.cat==='ep'||p.cat==='madera'),alt:p=>(/^ESC-(A|D|E|S|B2|B3)$/.test(p.id)||p.id==='PAS-1')&&(p.cat==='ep'||p.cat==='madera'),pil2:p=>p.id==='PIL-2s'};
})();
