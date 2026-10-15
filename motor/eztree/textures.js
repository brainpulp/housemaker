/* texturas de ez-tree (MIT, Dan Greenheck; cortezas de Poly Haven CC0): se cargan sólo las que se usan */
import * as THREE from 'three';
const L=new THREE.TextureLoader(),C={};
const url=f=>new URL('./assets/'+f,import.meta.url).href;
const load=(f,srgb=true)=>{if(C[f])return C[f];const t=L.load(url(f));t.premultiplyAlpha=true;if(srgb)t.colorSpace=THREE.SRGBColorSpace;return C[f]=t;};
const BARK={oak:'oak',willow:'willow',birch:'oak',pine:'oak'};
export function getBarkTexture(barkType,fileType,scale={x:1,y:1}){const b=BARK[barkType]||'oak';const t=load(`${b}_${fileType}_1k.jpg`,fileType==='color').clone();t.needsUpdate=true;
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.x=scale.x;t.repeat.y=1/scale.y;return t;}
const LEAF={oak:'oak',ash:'ash',aspen:'aspen',pine:'ash'};
export function getLeafTexture(leafType){return load(`${LEAF[leafType]||'oak'}_color.png`);}
