
import * as THREE from 'three';
import { gsap } from 'gsap';
import { CONFIG } from './config.js';

export class Photos {
  constructor(scene, textures, config) {
    this.config = config; this.cards = []; this.currentFront = 0; this.isAnimating = false;
    textures.forEach((tex, i) => {
      const card = this.createCard(tex, i); this.cards.push(card); scene.add(card.group);
    });
    this.cards.forEach(c => { c.group.visible = false; });
  }

  createCard(texture, index) {
    const group = new THREE.Group(); group.visible = false;
    const w = this.config.width, h = this.config.height;
    
    const geo = new THREE.PlaneGeometry(w, h, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.2, metalness: 0.1 });
    const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true; group.add(mesh);

    const backGeo = new THREE.BoxGeometry(w + 0.04, h + 0.04, 0.02);
    const backMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.9 });
    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.position.z = -0.011;
    group.add(backMesh);

    group.userData.phase = Math.random() * Math.PI * 2;
    return { group, mesh };
  }

  setFrontBack() {
    const f = this.cards[this.currentFront], b = this.cards[1 - this.currentFront];
    const O = this.config.backOffset;
    gsap.to(f.group.position, { x: 0, y: 0, z: 0, duration: 0.75 });
    gsap.to(f.group.rotation, { x: 0, y: 0, z: 0, duration: 0.75 });
    gsap.to(f.group.scale, { x: 1, y: 1, z: 1, duration: 0.75 });
    
    gsap.to(b.group.position, { x: O.x, y: O.y, z: O.z, duration: 0.75 });
    gsap.to(b.group.rotation, { x: 0, y: 0.1, z: -0.05, duration: 0.75 });
    gsap.to(b.group.scale, { x: 0.94, y: 0.94, z: 0.94, duration: 0.75 });
  }

  show() {
    this.cards.forEach((card, i) => {
      card.group.visible = true; card.group.position.set(0, -0.5, -1);
      card.group.scale.set(0.1, 0.1, 0.1);
      gsap.to(card.group.position, { x: 0, y: 0, z: 0, duration: 1.2, delay: i*0.1, ease: 'expo.out' });
      gsap.to(card.group.scale, { x: 1, y: 1, z: 1, duration: 1.2, delay: i*0.1, ease: 'expo.out' });
    });
    setTimeout(() => this.setFrontBack(), 1000);
  }

  hide() {
    this.cards.forEach((card, i) => {
      gsap.to(card.group.position, { x: 0, y: -0.5, z: -1, duration: 0.7 });
      gsap.to(card.group.scale, { x: 0.1, y: 0.1, z: 0.1, duration: 0.7, onComplete: () => card.group.visible = false });
    });
  }

  shuffle(direction, audio) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    if (audio) audio.playShuffle();
    
    const f = this.cards[this.currentFront], b = this.cards[1 - this.currentFront];
    const dir = direction > 0 ? 1 : -1, D = 1.0;
    
    const tl = gsap.timeline({ onComplete: () => { this.currentFront = 1 - this.currentFront; this.isAnimating = false; this.setFrontBack(); } });
    
    tl.to(f.group.position, { keyframes: [{ x: dir*0.5, y: 0.3, z: 0.5, duration: D*0.4 }, { x: 0.14, y: -0.1, z: -0.2, duration: D*0.6 }] }, 0);
    tl.to(f.group.rotation, { keyframes: [{ z: dir*0.2, duration: D*0.4 }, { z: -0.05, duration: D*0.6 }] }, 0);
    
    tl.to(b.group.position, { keyframes: [{ x: -dir*0.5, y: 0.5, z: 0.8, duration: D*0.4 }, { x: 0, y: 0, z: 0, duration: D*0.6 }] }, 0);
    tl.to(b.group.rotation, { keyframes: [{ z: -dir*0.2, duration: D*0.4 }, { z: 0, duration: D*0.6 }] }, 0);
    tl.to(b.group.scale, { x: 1, y: 1, z: 1, duration: D }, 0);
  }

  update(mouse, t) {
    this.cards.forEach((card, i) => {
      if (!card.group.visible) return;
      const float = Math.sin(t * 1.5 + card.group.userData.phase) * 0.05;
      if (!this.isAnimating) {
        card.group.rotation.x += (-mouse.y * 0.15 - card.group.rotation.x) * 0.1;
        card.group.rotation.y += (mouse.x * 0.15 - card.group.rotation.y) * 0.1;
        card.group.position.y += ((i === this.currentFront ? 0 : -0.1) + float - card.group.position.y) * 0.1;
      }
    });
  }
}
