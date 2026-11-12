
import * as THREE from 'three';
export class Particles {
  constructor(scene) {
    const geo = new THREE.BufferGeometry();
    const count = 1500;
    const pos = new Float32Array(count * 3);
    for(let i=0; i<count*3; i+=3) {
      pos[i] = (Math.random()-0.5)*15;
      pos[i+1] = (Math.random()-0.5)*10;
      pos[i+2] = (Math.random()-0.5)*10;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.03, color: 0xffd896, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false
    });
    this.mesh = new THREE.Points(geo, mat); scene.add(this.mesh);
  }
  update(t) {
    const pos = this.mesh.geometry.attributes.position.array;
    for(let i=0; i<pos.length; i+=3) {
      pos[i+1] += Math.sin(t + pos[i]) * 0.005 + 0.002;
      if(pos[i+1] > 5) pos[i+1] = -5;
    }
    this.mesh.geometry.attributes.position.needsUpdate = true;
  }
}
