
import * as THREE from 'three';
export class AssetLoader {
  async loadPhotos(urls) {
    const loader = new THREE.TextureLoader(), bar = document.getElementById('loaderBar');
    let loaded = 0;
    return Promise.all(urls.map(url => new Promise(res => {
      loader.load(url, tex => {
        tex.colorSpace = THREE.SRGBColorSpace; loaded++;
        if(bar) bar.style.width = (loaded/urls.length)*100 + '%'; res(tex);
      }, undefined, () => {
        const c = document.createElement('canvas'); c.width=800; c.height=600;
        const ctx = c.getContext('2d'); ctx.fillStyle = '#333'; ctx.fillRect(0,0,800,600);
        loaded++; if(bar) bar.style.width = (loaded/urls.length)*100 + '%';
        res(new THREE.CanvasTexture(c));
      });
    })));
  }
}
