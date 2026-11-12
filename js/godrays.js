
import * as THREE from 'three';
export class GodRays {
  constructor(scene, config) {
    this.group = new THREE.Group(); scene.add(this.group);
    this.mats = [];
    for (let i=0; i<config.count; i++) {
      const w = 0.5+Math.random()*2, h = 9+Math.random()*5;
      const mat = new THREE.ShaderMaterial({
        uniforms: { uTime:{value:0}, uInt:{value:config.intensity*(0.5+Math.random()*0.8)}, uColor:{value:new THREE.Color(config.color)}, uSeed:{value:Math.random()*100} },
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `
          uniform float uTime, uInt, uSeed; uniform vec3 uColor; varying vec2 vUv;
          void main() {
            float v = smoothstep(0.0,0.16,vUv.y)*smoothstep(1.0,0.55,vUv.y);
            float h = smoothstep(0.0,0.4,vUv.x)*smoothstep(1.0,0.6,vUv.x);
            float f = 0.7+0.3*sin(uTime*0.6+uSeed);
            gl_FragColor = vec4(uColor, v*h*uInt*f);
          }`,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w,h), mat);
      mesh.position.set((Math.random()-0.5)*9, -2+Math.random()*4, -3-Math.random()*3);
      mesh.rotation.z = -0.35+(Math.random()-0.5)*0.4;
      this.group.add(mesh); this.mats.push(mat);
    }
  }
  update(t) { this.mats.forEach(m => m.uniforms.uTime.value = t); }
}
