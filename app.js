import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './loaders/RGBELoader.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18/+esm';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// --- Core Setup ---
const canvas = document.getElementById('marble-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff);
renderer.toneMappingExposure = 1.8;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.5, 3);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 2;
controls.maxDistance = 5;
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.target.set(0, 1, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
const materialDefaultMarble = new CANNON.Material();
const materialGround = new CANNON.Material();
world.addContactMaterial(new CANNON.ContactMaterial(materialDefaultMarble, materialGround, {
  friction: 0.4,
  restitution: 0.6,
}));
const groundBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: materialGround });
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

const marbles = [];
const ray = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// --- Setup Environment Map (HDR) ---
new RGBELoader().setDataType(THREE.UnsignedByteType).load('assets/zebra.hdr', (hdr) => {
  const env = pmrem.fromEquirectangular(hdr).texture;
  scene.environment = env;
  hdr.dispose();
  pmrem.dispose();

  // Now we can create marbles
  initMarbles();  
  animate();
});

// --- Marble Factory Function ---
function createMarble({ position, colourHex, normalTex, glbUrl, linkUrl }) {
  const group = new THREE.Group();
  group.position.copy(position);

  const normalMap = normalTex
    ? new THREE.TextureLoader().load(normalTex)
    : null;
  if (normalMap) normalMap.colorSpace = THREE.NoColorSpace;

  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colourHex),
    roughness: 0.3,
    metalness: 0,
    transmission: 0.9,
    transparent: true,
    opacity: 0.8,
    thickness: 2.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.01,
    envMapIntensity: 2.5,
    normalMap: normalMap,
  });

  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), material);
  mesh.add(new THREE.Group()); // rotator container
  group.add(mesh);
  scene.add(group);

  const body = new CANNON.Body({
    mass: 3,
    shape: new CANNON.Sphere(1),
    material: materialDefaultMarble,
    position: new CANNON.Vec3(position.x, position.y + 5, position.z),
  });
  body.angularDamping = 0.4;
  body.linearDamping = 0.1;
  world.addBody(body);

  // Load inner GLB if provided
  if (glbUrl) {
    new GLTFLoader().load(glbUrl, (gltf) => {
      const obj = gltf.scene;
      const box = new THREE.Box3().setFromObject(obj);
      const size = new THREE.Vector3();
      box.getSize(size);
      const scaleFactor = (1 * 2 * 0.9) / Math.max(size.x, size.y, size.z);
      obj.scale.setScalar(scaleFactor);
      const center = new THREE.Vector3();
      box.getCenter(center);
      obj.position.sub(center);

      obj.traverse(c => {
        if (c.isMesh && c.material) { c.material.envMapIntensity = 2.5; c.material.needsUpdate = true; }
      });

      mesh.children[0].add(obj);
    });
  }

  mesh.userData = { body, link: linkUrl };
  marbles.push(mesh);

  return mesh;
}

// --- Initialize Some Example Marbles ---
function initMarbles() {
  createMarble({
    position: new THREE.Vector3(-2, 0, 0),
    colourHex: '#2B1CFF',
    normalTex: 'assets/marble-normal.jpg',
    glbUrl: 'assets/inner-model-5.glb',
    linkUrl: 'https://example.com/project1',
  });
  createMarble({
    position: new THREE.Vector3(2, 0, 0),
    colourHex: '#FF5733',
    normalTex: 'assets/marble-normal2.jpg',
    glbUrl: null,
    linkUrl: 'https://example.com/project2',
  });
}

// --- Animation and Interaction ---
function animate() {
  requestAnimationFrame(animate);
  world.step(1 / 60);

  marbles.forEach(m => {
    m.position.copy(m.userData.body.position);
    m.quaternion.copy(m.userData.body.quaternion);
  });

  ray.setFromCamera(mouse, camera);
  const hit = ray.intersectObjects(marbles);
  document.body.style.cursor = hit.length ? 'pointer' : 'default';

  hit.forEach(h => {
    const mesh = h.object;
    mesh.children[0].rotation.y += 0.005;           // inner part
    mesh.parent.rotation.y += 0.005;                 // outer wrapper
  });

  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('click', () => {
  ray.setFromCamera(mouse, camera);
  const hit = ray.intersectObjects(marbles);
  if (hit.length) window.open(hit[0].object.userData.link, '_blank');
});
