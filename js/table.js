
import * as THREE from 'three';
export class Table {
  constructor(scene) {
    const tex = this.makeWoodTexture();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2.5, 2.5);
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, metalness: 0.05 });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), mat);
    mesh.rotation.x = -Math.PI / 2; mesh.position.y = -1.4; mesh.receiveShadow = true;
    scene.add(mesh);
  }
  makeWoodTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 2048;
    const ctx = c.getContext('2d'); ctx.fillStyle = '#2a1a0f'; ctx.fillRect(0,0,2048,2048);
    for(let i=0; i<150; i++) {
      ctx.strokeStyle = `rgba(10,5,2,${0.3+Math.random()*0.4})`; ctx.lineWidth = 1 + Math.random()*3;
      ctx.beginPath();
      for(let x=0; x<=2048; x+=4) { const y = Math.random()*2048; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y+Math.sin(x*0.01)*10); }
      ctx.stroke();
    }
    return new THREE.CanvasTexture(c);
  }
}
