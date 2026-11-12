
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { CONFIG } from './config.js';

export class Scene {
  constructor(canvas) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CONFIG.backgroundColor);
    this.scene.fog = new THREE.Fog(CONFIG.backgroundColor, CONFIG.fog.near, CONFIG.fog.far);
    
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = CONFIG.postprocess.exposure;
    
    this.camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(...CONFIG.camera.position);
    this.camera.lookAt(...CONFIG.camera.lookAt);

    this.setupLights();
    this.setupPostprocessing();
    window.addEventListener('resize', () => this.onResize());
  }

  setupLights() {
    // Усилил свет, чтобы 100% было видно, если рендер работает
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const sun = new THREE.DirectionalLight(0xffd896, 3.0);
    sun.position.set(-4, 6, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    this.scene.add(sun);
    
    const fill = new THREE.PointLight(0xff9850, 1.5, 15, 2);
    fill.position.set(3.5, 1.5, 3);
    this.scene.add(fill);
  }

  setupPostprocessing() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), CONFIG.postprocess.bloomStrength, CONFIG.postprocess.bloomRadius, CONFIG.postprocess.bloomThreshold);
    this.composer.addPass(this.bloom);
    // Убрал кастомный шейдер, который мог ронять WebGL
  }

  updateCamera(mouse) {
    const base = CONFIG.camera.position;
    this.camera.position.x = base[0] + mouse.x * CONFIG.parallax.cameraShift;
    this.camera.position.y = base[1] - mouse.y * CONFIG.parallax.cameraShift * 0.6;
    this.camera.lookAt(...CONFIG.camera.lookAt);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  start(tickFn) {
    this.renderer.setAnimationLoop(() => { 
      tickFn(); 
      this.composer.render(); 
    });
  }
}
