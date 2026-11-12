
export const CONFIG = {
  backgroundColor: 0x120a05,
  fog: { near: 5, far: 15 },
  envelope: { width: 1.4, height: 1.0, thickness: 0.012, color: 0xe9dcc0, colorDark: 0xd4c19c, vNotchY: 0.15 },
  hover: { lift: 0.18, duration: 0.75 },
  open: { dropBy: -2.2, tilt: -0.5, delay: 0.55 },
  photos: { width: 4.0, height: 3.0, floatAmplitude: 0.06, floatSpeed: 0.9, backOffset: { x: 0.14, y: -0.10, z: -0.20 }, backScale: 0.94 },
  parallax: { maxTilt: 0.14, cameraShift: 0.22, lerp: 0.09 },
  shuffle: { duration: 1.0, wheelCooldown: 350 },
  godRays: { count: 7, color: 0xffd896, intensity: 0.42 },
  camera: { fov: 35, position: [0, 0.1, 5.4], lookAt: [0, -0.1, 0] },
  postprocess: { bloomStrength: 0.42, bloomRadius: 0.72, bloomThreshold: 0.82, exposure: 1.15 }
};
