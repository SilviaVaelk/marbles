import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('marble-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff);
renderer.toneMappingExposure = 1.8;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 6);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hovered = null;

// Physics setup
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
const marbleMaterial = new CANNON.Material();
const groundMaterial = new CANNON.Material();
world.addContactMaterial(new CANNON.ContactMaterial(marbleMaterial, groundMaterial, { friction: 0.4, restitution: 0.6 }));

const groundBody = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Plane(),
  material: groundMaterial
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

// Environment loader
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

new RGBELoader()
  .setDataType(THREE.UnsignedByteType)
  .load('assets/zebra.hdr', (hdrTexture) => {
    const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
    scene.environment = envMap;
    hdrTexture.dispose();
    pmremGenerator.dispose();
    initMarbles();
  });

const marbles = [];

function createMarble({ color, glb, link, position, delay = 0, size = 1 }) {
  const normalMap = new THREE.TextureLoader().load('assets/marble-normal.jpg');
  normalMap.colorSpace = THREE.NoColorSpace;

  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: 0.3,
    metalness: 0,
    transmission: 0.9,
    transparent: true,
    opacity: 0.85,
    thickness: 2.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.01,
    envMapIntensity: 2.5,
    normalMap
  });

  const rotator = new THREE.Group();          // Rotates on hover
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(size, 64, 64), material);
  rotator.add(sphere);

  const visualGroup = new THREE.Group();      // Physics controls this
  visualGroup.add(rotator);
  scene.add(visualGroup);

  const light = new THREE.PointLight(0xffffff, 1.5, 3);
  light.position.set(0, 0, 0);
  rotator.add(light);

  const body = new CANNON.Body({
    mass: 3,
    shape: new CANNON.Sphere(size),
    position: new CANNON.Vec3(...position.toArray()),
    material: marbleMaterial
  });
  body.angularDamping = 0.4;
  body.linearDamping = 0.1;
  world.addBody(body);

  const startTime = performance.now();

  const marble = { visualGroup, rotator, mesh: sphere, body, link, delay, startTime, size };
  marbles.push(marble);

  if (glb) {
    new GLTFLoader().load(glb, (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const modelSize = new THREE.Vector3();
      box.getSize(modelSize);
      const scale = (size * 2 * 0.9) / Math.max(modelSize.x, modelSize.y, modelSize.z);
      model.scale.setScalar(scale);

      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.sub(center);

      model.traverse(c => {
        if (c.isMesh) {
          c.material.envMapIntensity = 2.5;
          c.material.needsUpdate = true;
        }
      });

      rotator.add(model);
    });
  }
}

function initMarbles() {
  createMarble({
    color: '#d9d9ff',
    glb: 'assets/inner-model.glb',
    link: 'https://example.com/project1',
    position: new THREE.Vector3(-2, 5, 0),
    delay: 0,
    size: 1
  });
  createMarble({
    color: '#ffeedd',
    glb: 'assets/inner-model-5.glb',
    link: 'https://example.com/project2',
    position: new THREE.Vector3(2, 5, 0),
    delay: 800,
    size: 1.2
  });

  animate();
}

window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('click', () => {
  if (hovered && hovered.link) window.open(hovered.link, '_blank');
});

function animate() {
  requestAnimationFrame(animate);
  world.step(1 / 60);

  hovered = null;
  const now = performance.now();

  marbles.forEach(m => {
    if (now - m.startTime > m.delay) {
      m.visualGroup.position.copy(m.body.position);
      m.visualGroup.quaternion.copy(m.body.quaternion);
    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(m.mesh);
    if (intersects.length) {
      m.rotator.rotation.y += 0.005;
      hovered = m;
      document.body.style.cursor = 'pointer';
    }
  });

  if (!hovered) document.body.style.cursor = 'default';

  controls.update();
  renderer.render(scene, camera);
}
