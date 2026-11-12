
import * as THREE from 'three';
import { gsap } from 'gsap';
import { CONFIG } from './config.js';

export class Envelope {
  constructor(scene, config) {
    this.config = config; this.isHovered = false; this.isOpen = false; this.sealBroken = false;
    this.root = new THREE.Group(); this.root.position.set(0, -0.25, 0); scene.add(this.root);
    this.anim = new THREE.Group(); this.root.add(this.anim);

    const w = config.width, h = config.height, d = config.thickness;
    const mat = (c, r=0.8) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
    
    this.anim.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(config.colorDark)));
    
    const letter = new THREE.Mesh(new THREE.PlaneGeometry(w*0.94, h*1.1), mat(0xf6eed8));
    letter.position.set(0, h*0.08, d/2-0.001); this.anim.add(letter);
    
    this.miniPhotos = [];
    for (let i=0; i<2; i++) {
      const mp = new THREE.Mesh(new THREE.PlaneGeometry(w*0.28, h*0.36), new THREE.MeshStandardMaterial({ color: 0xc9b894 }));
      mp.position.set((i-0.5)*w*0.36, h*0.3, d/2-0.0005); this.anim.add(mp); this.miniPhotos.push(mp);
    }

    const vY = config.vNotchY;
    const frontShape = new THREE.Shape();
    frontShape.moveTo(-w/2,-h/2); frontShape.lineTo(w/2,-h/2); frontShape.lineTo(w/2,h/2);
    frontShape.lineTo(0,vY); frontShape.lineTo(-w/2,h/2); frontShape.lineTo(-w/2,-h/2);
    const front = new THREE.Mesh(new THREE.ShapeGeometry(frontShape), mat(config.color));
    front.position.z = d/2 + 0.001; this.anim.add(front);

    const flapShape = new THREE.Shape();
    flapShape.moveTo(-w/2,0); flapShape.lineTo(w/2,0); flapShape.lineTo(0,-h*0.62); flapShape.lineTo(-w/2,0);
    this.flap = new THREE.Mesh(new THREE.ShapeGeometry(flapShape), mat(0xecdfc4));
    this.flap.position.set(0, h/2, d/2+0.002); this.anim.add(this.flap);

    const sealGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 32);
    const sealMat = new THREE.MeshStandardMaterial({ color: 0x9b111e, roughness: 0.3, metalness: 0.1 });
    this.seal = new THREE.Mesh(sealGeo, sealMat);
    this.seal.rotation.x = Math.PI / 2;
    this.seal.position.set(0, vY * 0.8, d/2 + 0.015);
    this.anim.add(this.seal);

    this.hitbox = new THREE.Mesh(new THREE.BoxGeometry(w, h, d*5), new THREE.MeshBasicMaterial({ visible: false }));
    this.hitbox.position.z = d/2; this.anim.add(this.hitbox);

    this.createLabel(w, h, d);
  }

  async createLabel(w, h, d) {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const canvas = document.createElement('canvas'); canvas.width = 2048; canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    ctx.font = 'italic 96px "Great Vibes"'; ctx.fillStyle = '#5a3e22'; ctx.textAlign = 'center';
    ctx.fillText('From:', 1024, 300);
    ctx.font = '176px "Great Vibes"'; ctx.fillStyle = '#3a2814';
    ctx.fillText('Reverie-City', 1024, 520);
    ctx.font = '158px "Great Vibes"';
    ctx.fillText('Soul Department', 1024, 720);
    const tex = new THREE.CanvasTexture(canvas);
    const label = new THREE.Mesh(new THREE.PlaneGeometry(w*0.86, w*0.43), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    label.position.set(0, -h*0.3, d/2+0.005); this.anim.add(label);
  }

  setMiniPhotos(tex1, tex2) {
    [tex1, tex2].forEach((tex, i) => {
      const mp = this.miniPhotos[i];
      mp.material.map = tex; mp.material.color.set(0xffffff); mp.material.needsUpdate = true;
    });
  }

  setHover(hovered) {
    if (this.isOpen || hovered === this.isHovered || !this.sealBroken) return;
    this.isHovered = hovered;
    gsap.to(this.anim.position, { y: hovered ? CONFIG.hover.lift : 0, duration: 0.5 });
    gsap.to(this.flap.rotation, { x: hovered ? -0.4 : 0, duration: 0.5 });
  }

  breakSeal() {
    if (this.sealBroken) return;
    this.sealBroken = true;
    gsap.to(this.seal.scale, { x: 0, y: 0, z: 0, duration: 0.4, ease: 'back.in(2)' });
    gsap.to(this.flap.rotation, { x: -0.1, duration: 0.5, delay: 0.2 });
  }

  open() {
    this.isOpen = true;
    gsap.to(this.flap.rotation, { x: -Math.PI * 0.95, duration: 0.9, ease: 'power3.inOut' });
    gsap.to(this.anim.position, { y: CONFIG.open.dropBy, duration: 1.1, delay: 0.5 });
  }

  close() {
    this.isOpen = false;
    gsap.to(this.anim.position, { y: 0, duration: 0.9 });
    gsap.to(this.flap.rotation, { x: 0, duration: 0.9 });
  }

  update(mouse, t) {
    if (this.isOpen) return;
    this.root.rotation.y += (mouse.x * 0.06 - this.root.rotation.y) * 0.1;
    if (this.sealBroken) this.seal.position.y = this.config.vNotchY * 0.8 + Math.sin(t*2)*0.01;
  }
}
