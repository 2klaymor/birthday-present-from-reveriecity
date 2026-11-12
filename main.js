import * as THREE from 'three';
import { gsap } from 'gsap';

// ==========================================
// 1. СЦЕНА И КАМЕРА (БЕЗ СВЕТА)
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Черный цвет на случай, если фон не прогрузится


const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 8);


const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.NoToneMapping; // <--- ОТКЛЮЧАЕМ ПЕРЕСВЕТ

const bgTexture = new THREE.TextureLoader().load('images/bg.png');
bgTexture.colorSpace = THREE.SRGBColorSpace;
bgTexture.wrapS = THREE.ClampToEdgeWrapping;
bgTexture.wrapT = THREE.ClampToEdgeWrapping;

const bgGeo = new THREE.PlaneGeometry(30, 30);
const bgMat = new THREE.MeshBasicMaterial({ map: bgTexture });
const bgMesh = new THREE.Mesh(bgGeo, bgMat);

// --- ГРАДИЕНТНОЕ ЗАТЕМНЕНИЕ ФОНА (Снизу вверх) ---
// 1. Создаем холст для градиента
const gradCanvas = document.createElement('canvas');
gradCanvas.width = 1;
gradCanvas.height = 512;
const gCtx = gradCanvas.getContext('2d');

// 2. Рисуем градиент: сверху прозрачный, снизу черный
const grad = gCtx.createLinearGradient(0, 0, 0, 512);
grad.addColorStop(0, 'rgba(0,0,0,0)');    // Верх (прозрачный)
// grad.addColorStop(0.05, 'rgba(0,0,0,0)'); // Середина (полупрозрачный)
grad.addColorStop(0.27, 'rgba(0,0,0,1)'); // Середина (полупрозрачный)
grad.addColorStop(1, 'rgba(0,0,0,1)'); // Низ (почти сплошной черный)
gCtx.fillStyle = grad;
gCtx.fillRect(0, 0, 1, 512);

// 3. Делаем текстуру
const gradTex = new THREE.CanvasTexture(gradCanvas);

// 4. Создаем плоскость с этим градиентом
const gradGeo = new THREE.PlaneGeometry(30, 30);
const gradMat = new THREE.MeshBasicMaterial({ 
    map: gradTex, 
    transparent: true, 
    depthWrite: false // Важно, чтобы не было Z-fighting
});
const gradMesh = new THREE.Mesh(gradGeo, gradMat);

// 5. Ставим её чуть впереди фоновой стены
gradMesh.position.set(0, 0, -9.0); 
scene.add(gradMesh);

// // СТАВИМ РОВНО НА ГОРИЗОНТ СТОЛА:
// // Стол упадет центром на z=-1, его длина 16, значит дальний край будет на z = -9.
// // Ставим стену на -9.05 для идеальной стыковки без мерцаний.
bgMesh.position.set(0, 0, -9.05);

// // Вращение не нужно (0 по умолчанию), так как нам нужна вертикальная стена перпендикулярно полу.
scene.add(bgMesh);




// Одна яркая лампа прямо над конвертом
const lampLight = new THREE.PointLight(0xffeebb, 30, 20, 2); 
lampLight.position.set(0, 1, 4); 
lampLight.castShadow = true; 
lampLight.shadow.mapSize.width = 256;
lampLight.shadow.mapSize.height = 256;
// lampLight.layers.set(0); // <--- СВЕТИТ ТОЛЬКО НА 0 СЛОЙ
scene.add(lampLight);




// ==========================================
// 2. СТОЛ (С ТЕКСТУРОЙ)
// ==========================================
const alphaCanvas = document.createElement('canvas');
alphaCanvas.width = 512; 
alphaCanvas.height = 512;
const aCtx = alphaCanvas.getContext('2d');

// Рисуем радиальный градиент: в центре белый (непрозрачный), по краям черный (прозрачный)
const aGradient = aCtx.createRadialGradient(256, 256, 50, 256, 256, 250);
aGradient.addColorStop(0, 'rgba(255,255,255,1)');   // Центр стола
// aGradient.addColorStop(0, 'rgba(255,255,255,0.8)'); // Начало растворения
aGradient.addColorStop(0.7, 'rgba(0,0,0,0)');         // Края уходят в 0 (прозрачность)

aCtx.fillStyle = aGradient;
aCtx.fillRect(0, 0, 512, 512);

// Делаем текстуру из этого градиента
const alphaTex = new THREE.CanvasTexture(alphaCanvas);



const tableGeo = new THREE.PlaneGeometry(32, 16);
const texLoaderTable = new THREE.TextureLoader();
const woodTexture = texLoaderTable.load('images/wood.jpg');
woodTexture.colorSpace = THREE.SRGBColorSpace;
woodTexture.wrapS = THREE.ClampToEdgeWrapping; 
woodTexture.wrapT = THREE.ClampToEdgeWrapping;
woodTexture.repeat.set(1, 1); 
woodTexture.anisotropy = renderer.capabilities.getMaxAnisotropy(); 


// 2. Загружаем текстуру дерева
const tableMat = new THREE.MeshStandardMaterial({ 
    map: woodTexture,
    alphaMap: alphaTex,       // <--- ПРИМЕНЯЕМ МАСКУ ПРОЗРАЧНОСТИ
    transparent: true,        // <--- ВКЛЮЧАЕМ ПРОЗРАЧНОСТЬ
    roughness: 0.7, 
    metalness: 0.1
}); 
const tableMesh = new THREE.Mesh(tableGeo, tableMat);



// Изначально стол стоит вертикально сзади
tableMesh.rotation.x = 0; 
tableMesh.position.set(0, 0, -2); 
scene.add(tableMesh);

// ==========================================
// 2. СЛОИ КОНВЕРТА (Z-ПОРЯДОК)
// ==========================================
const envW = 3.5;
const envH = 2.5;
const envGroup = new THREE.Group();
scene.add(envGroup);

// Материалы без света (игнорируют освещение, цвета идеальные)
const matBack = new THREE.MeshBasicMaterial({ color: 0xccb58c });
const matFront = new THREE.MeshBasicMaterial({ color: 0xe9dcc0 });
const matFlap = new THREE.MeshBasicMaterial({ color: 0xf2e6ce });

// --- Задняя стенка (Z = -0.04) ---
const backGeo = new THREE.BoxGeometry(envW, envH, 0.02);
const backMesh = new THREE.Mesh(backGeo, matBack);
backMesh.position.z = -0.04;
envGroup.add(backMesh);

// --- Внутреннее дно (Z = -0.03) ---
const innerGeo = new THREE.PlaneGeometry(envW - 0.1, envH - 0.1);
const innerMesh = new THREE.Mesh(innerGeo, new THREE.MeshBasicMaterial({ color: 0xd4c19c }));
innerMesh.position.z = -0.03;
envGroup.add(innerMesh);

// --- ФОТОГРАФИИ (Z = 0 и -0.01) ---
const texLoader = new THREE.TextureLoader();
const photoW = 3.2;
const photoH = 2.4;
const photoGeo = new THREE.PlaneGeometry(photoW, photoH);

const photoMat1 = new THREE.MeshBasicMaterial({ map: texLoader.load('images/image1.png') });
photoMat1.map.colorSpace = THREE.SRGBColorSpace;
const photoMat2 = new THREE.MeshBasicMaterial({ map: texLoader.load('images/image2.png') });
photoMat2.map.colorSpace = THREE.SRGBColorSpace;

const photo1 = new THREE.Mesh(photoGeo, photoMat1);
// photo1.layers.set(2); // <--- ПЕРЕНОСИМ НА 1 СЛОЙ
// ...
const photo2 = new THREE.Mesh(photoGeo, photoMat2);
// photo2.layers.set(2); // <--- ПЕРЕНОСИМ НА 1 СЛОЙ



photo1.position.set(0, 0, 0);
photo2.position.set(0, 0, -0.01);
envGroup.add(photo1);
envGroup.add(photo2);

// --- Передняя стенка "М" (Z = 0.02) ---
const frontShape = new THREE.Shape();
frontShape.moveTo(-envW/2, -envH/2);
frontShape.lineTo(envW/2, -envH/2);
frontShape.lineTo(envW/2, envH/2);
frontShape.lineTo(0, envH*0.05); // V-вырез
frontShape.lineTo(-envW/2, envH/2);
frontShape.lineTo(-envW/2, -envH/2);
const frontGeo = new THREE.ExtrudeGeometry(frontShape, { depth: 0.02, bevelEnabled: false });
const frontMesh = new THREE.Mesh(frontGeo, matFront);
frontMesh.position.z = 0.02;
envGroup.add(frontMesh);

// --- КЛАПАН (Z = 0.04) ---
const flapShape = new THREE.Shape();
flapShape.moveTo(-envW/2, 0);
flapShape.lineTo(envW/2, 0);
flapShape.lineTo(0, -envH*0.525);
flapShape.lineTo(-envW/2, 0);
const flapGeo = new THREE.ExtrudeGeometry(flapShape, { depth: 0.02, bevelEnabled: false });
const flapMesh = new THREE.Mesh(flapGeo, matFlap);
// Изначально клапан спереди (Z = 0.04)
flapMesh.position.set(0, envH/2, 0.04);
envGroup.add(flapMesh);

// --- ТЕКСТ (Z = 0.025) ---
async function createText() {
    try {
        await document.fonts.load('130px "Typewriter"');
    } catch(e) {}
    await document.fonts.ready;

    const c = document.createElement('canvas');
    c.width = 1024; c.height = 512;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 1024, 512);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#E93C35';
    
    ctx.font = 'italic 100px "Typewriter", serif';
    ctx.fillText('From:', 512, 140);
    ctx.font = '200px "Typewriter", cursive';
    ctx.fillText('Reverie-City', 512, 270);
    ctx.fillText('Soul Department', 512, 390);
    
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    
    const textMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    textMesh.position.set(0, -envH * 0.23, 0.1);
    envGroup.add(textMesh);
}
createText();

// ==========================================
// 3. ЕДИНЫЙ ТАЙМЛАЙН АНИМАЦИИ (ЛУП)
// ==========================================
let isOpen = false;
let isAnimating = false;
let currentFront = 0;
let wheelCooldown = 0;
let isHovering = false;

const openTl = gsap.timeline({ 
    paused: true,
    onStart: () => { isAnimating = true; },
    onComplete: () => { isAnimating = false; },
    onReverseComplete: () => { isAnimating = false; }
});

// 1. СТОЛ ПАДАЕТ (Поворачивается на 90 градусов)
openTl.to(tableMesh.rotation, { x: -Math.PI / 2, duration: 1.5, ease: "power2.inOut" }, 0);
openTl.to(tableMesh.position, { y: -3, z: -1, duration: 1.5, ease: "power2.inOut" }, 0);

// 1.5 ГРАДИЕНТ УЕЗЖАЕТ ВНИЗ ВМЕСТЕ С КРАЕМ СТОЛА
// Двигаем градиент вниз по Y (примерно на -8 или -10), чтобы он следовал за камерой
openTl.to(gradMesh.position, { y: -8, duration: 1.5, ease: "power2.inOut" }, 0);

// 1. Клапан откидывается и уезжает НАЗАД по Z (чтобы не перекрывать фотки)
openTl.to(flapMesh.rotation, { x: -Math.PI, duration: 0.8, ease: "power2.inOut" }, 0);
openTl.to(flapMesh.position, { z: -0.2, duration: 0.8, ease: "power2.inOut" }, 0);

// 2. Фотографии выезжают ВВЕРХ из конверта
openTl.to([photo1.position, photo2.position], { y: 2.5, duration: 0.8, ease: "power2.inOut" }, 0.2);

// 3. Камера уезжает ВВЕРХ (конверт визуально падает вниз)
openTl.to(camera.position, { y: 8, duration: 1.5, ease: "power2.inOut" }, 0.5);

// 4. Фотки встают по центру нового вида и летят вперед (Z)
openTl.to(photo1.position, { x: 0, y: 7.65, z: 2.5, duration: 1.0, ease: "power2.out" }, 1.2);
openTl.to(photo2.position, { x: 0.25, y: 7.45, z: 2.2, duration: 1.0, ease: "power2.out" }, 1.2);

// // 5. Фотографии раздуваются на весь экран
openTl.to(photo1.scale, { x: 1.4, y: 1.4, z: 0, duration: 1.0, ease: "power2.out" }, 1.4);
openTl.to(photo2.scale, { x: 1.4, y: 1.4, z: 0, duration: 1.0, ease: "power2.out" }, 1.4);

// ==========================================
// 4. ИНТЕРАКЦИИ
// ==========================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

    if (isOpen || isAnimating) return;
    
    mouse.x = mouseX;
    mouse.y = mouseY;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([backMesh, frontMesh, flapMesh]);
    
    if (intersects.length > 0 && !isHovering) {
        isHovering = true;
        document.body.style.cursor = 'pointer';
        gsap.to(envGroup.position, { y: 0.3, duration: 0.6, ease: "power2.out" });
        gsap.to(flapMesh.rotation, { x: -Math.PI * 0.7, duration: 0.6, ease: "power2.out" });
    } else if (intersects.length === 0 && isHovering) {
        isHovering = false;
        document.body.style.cursor = 'default';
        gsap.to(envGroup.position, { y: 0, duration: 0.6, ease: "power2.out" });
        gsap.to(flapMesh.rotation, { x: 0, duration: 0.6, ease: "power2.out" });
    }
});

document.getElementById('webgl').addEventListener('click', () => {
    if (isHovering && !isAnimating && !isOpen) {
        isOpen = true;
        document.body.style.cursor = 'default';
        document.getElementById('hint').style.opacity = 0;
        document.getElementById('closeBtn').classList.add('visible');
        
        openTl.play();
    }
});

document.getElementById('closeBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isOpen || isAnimating) return;
    isOpen = false;
    isAnimating = true;
    
    document.getElementById('closeBtn').classList.remove('visible');
    document.getElementById('hint').style.opacity = 1;

    // Сбрасываем повороты от мышки и сдвиги от колесика перед закрытием
    gsap.killTweensOf([photo1.position, photo2.position, photo1.rotation, photo2.rotation]);
    gsap.to([photo1.rotation, photo2.rotation], { x: 0, y: 0, z: 0, duration: 0.4, ease: "power2.out" });
    gsap.to([photo1.position, photo2.position], { x: 0, duration: 0.4, ease: "power2.out" });

    // Проматываем анимацию НАЗАД (идеальный луп)
    openTl.reverse();
});

// ==========================================
// 5. ЛИСТАНИЕ КОЛЕСИКОМ
// ==========================================
window.addEventListener('wheel', (e) => {
    if (!isOpen || isAnimating) return;
    if (openTl.progress() < 0.99) return; 
    if (Math.abs(e.deltaY) < 20) return;
    
    const now = Date.now();
    if (now - wheelCooldown < 800) return;
    wheelCooldown = now;
    
    const dir = e.deltaY > 0 ? 1 : -1;
    const front = currentFront === 0 ? photo1 : photo2;
    const back = currentFront === 0 ? photo2 : photo1;
    
    gsap.killTweensOf([front.position, back.position, front.scale, back.scale]);

    // 4. Фотки встают по центру нового вида и летят вперед (Z)
        // openTl.to(photo1.position, { x: 0, y: 7.65, z: 2.5, duration: 1.0, ease: "power2.out" }, 1.2);
        // openTl.to(photo2.position, { x: 0.25, y: 7.45, z: 2.2, duration: 1.0, ease: "power2.out" }, 1.2);

        // // // 5. Фотографии раздуваются на весь экран
        // openTl.to(photo1.scale, { x: 1.4, y: 1.4, z: 0, duration: 1.0, ease: "power2.out" }, 1.4);
        // openTl.to(photo2.scale, { x: 1.4, y: 1.4, z: 0, duration: 1.0, ease: "power2.out" }, 1.4);

    if (dir > 0) {
        gsap.to(front.position, { x: 0, y: 7.65, z: 2.5, duration: 0.6, ease: "power2.in" });
        gsap.to(front.rotation, { z: -0.02, duration: 0.6 });
        gsap.to(front.scale, { x: 1.6, y: 1.6, z: 0, duration: 0.6 });
        
        gsap.to(back.position, { x: 1, y: 7.45, z: 2.1, duration: 0.6, ease: "power2.out" });
        gsap.to(back.rotation, { z: 0.12, duration: 0.6 });
        gsap.to(back.scale, { x: 1.2, y: 1.2, z: 0, duration: 0.6 });
    } else {
        gsap.to(front.position, { x: 0, y: 7.65, z: 2.5, duration: 0.6, ease: "power2.in" });
        gsap.to(front.rotation, { z: -0.02, duration: 0.6 });
        gsap.to(front.scale, { x: 1.6, y: 1.6, z: 0, duration: 0.6 });
        
        gsap.to(back.position, { x: 1, y: 7.45, z: 2.1, duration: 0.6, ease: "power2.out" });
        gsap.to(back.rotation, { z: 0.12, duration: 0.6 });
        gsap.to(back.scale, { x: 1.2, y: 1.2, z: 0, duration: 0.6 });
    }
    
    setTimeout(() => {
        currentFront = 1 - currentFront;
    }, 650);
});

// ==========================================
// 6. ЦИКЛ РЕНДЕРА (ПАРАЛЛАКС)
// ==========================================
function animate() {
    requestAnimationFrame(animate);

    if (!isAnimating) {
        if (!isOpen) {
            envGroup.rotation.y += (mouseX * 0.15 - envGroup.rotation.y) * 0.05;
            envGroup.rotation.x += (-mouseY * 0.15 - envGroup.rotation.x) * 0.05;
        } else {
            const targetRotX = -mouseY * 0.15;
            const targetRotY = mouseX * 0.15;

            const front = currentFront === 0 ? photo1 : photo2;
            front.rotation.y += (targetRotY - front.rotation.y) * 0.05;
            front.rotation.x += (targetRotX - front.rotation.x) * 0.05;

            const back = currentFront === 0 ? photo2 : photo1;
            back.rotation.y += (targetRotY * 1.2 - back.rotation.y) * 0.05;
            back.rotation.x += (targetRotX * 1.2 - back.rotation.x) * 0.05;
        }
    }

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});