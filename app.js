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

// Physics
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
const marbleMaterial = new CANNON.Material();
const groundMaterial = new CANNON.Material();
world.addContactMaterial(new CANNON.ContactMaterial(marbleMaterial, groundMaterial, {
  friction: 0.4, restitution: 0.6,
}));

const marbleToMarbleContact = new CANNON.ContactMaterial(
  marbleMaterial,
  marbleMaterial,
  {
    friction: 0.3,
    restitution: 0.7,
  }
);
world.addContactMaterial(marbleToMarbleContact);

const groundBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: groundMaterial });
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

// Bounding walls
const wallMaterial = new CANNON.Material();
const wallSize = 10; // adjust to fit your scene size

// Left wall
const wallLeft = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: wallMaterial });
wallLeft.quaternion.setFromEuler(0, Math.PI / 2, 0);
wallLeft.position.set(-wallSize / 2, 0, 0);
world.addBody(wallLeft);

// Right wall
const wallRight = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: wallMaterial });
wallRight.quaternion.setFromEuler(0, -Math.PI / 2, 0);
wallRight.position.set(wallSize / 2, 0, 0);
world.addBody(wallRight);

// Back wall
const wallBack = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: wallMaterial });
wallBack.quaternion.setFromEuler(0, 0, 0);
wallBack.position.set(0, 0, -wallSize / 2);
world.addBody(wallBack);

// Front wall
const wallFront = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: wallMaterial });
wallFront.quaternion.setFromEuler(0, Math.PI, 0);
wallFront.position.set(0, 0, wallSize / 2);
world.addBody(wallFront);


// Environment
const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

new RGBELoader()
  .setDataType(THREE.UnsignedByteType)
  .load('assets/zebra.hdr', (hdrTexture) => {
    const envMap = pmrem.fromEquirectangular(hdrTexture).texture;
    scene.environment = envMap;
    hdrTexture.dispose();
    pmrem.dispose();

    initMarbles(envMap);
  });

// Marble creation
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

  const rotator = new THREE.Group(); // Inner contents
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(size, 64, 64), material);
  sphere.castShadow = true;

  const visualGroup = new THREE.Group(); // Wrap both
  visualGroup.add(sphere);
  visualGroup.add(rotator);
  visualGroup.visible = false; // hide initially
  scene.add(visualGroup);

  const light = new THREE.PointLight(0xffffff, 1.5, 3);
  light.position.set(0, 0, 0);
  rotator.add(light);

  const body = new CANNON.Body({
    mass: 3,
    shape: new CANNON.Sphere(size),
    position: new CANNON.Vec3(...position.toArray()),
    material: marbleMaterial,
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
      const sizeVec = new THREE.Vector3();
      box.getSize(sizeVec);
      const scale = (size * 2 * 0.9) / Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
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

// Initialization
function initMarbles(envMap) {
  createMarble({
    color: '#d9d9ff',
    glb: 'assets/inner-model.glb',
    link: 'https://example.com/1',
    position: new THREE.Vector3(0, 5, 0),
    delay: 0,
    size: 1
  });

  createMarble({
    color: '#ffeedd',
    glb: 'assets/inner-model-5.glb',
    link: 'https://example.com/2',
    position: new THREE.Vector3(-1, 5, 0),
    delay: 200,
    size: 1.7
  });

    createMarble({
    color: '#fafafa',
    link: 'https://example.com/3',
    position: new THREE.Vector3(1, 5, 0),
    delay: 100,
    size: 0.7
  });

  animate();
}

// Interaction
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('click', () => {
  if (hovered && hovered.link) {
    window.open(hovered.link, '_blank');
  }
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  world.step(1 / 60);
  const now = performance.now();
  hovered = null;

  raycaster.setFromCamera(mouse, camera);

  marbles.forEach(marble => {
    const ready = now - marble.startTime > marble.delay;
    if (ready) {
      if (!marble.visualGroup.visible) marble.visualGroup.visible = true;
      marble.visualGroup.position.copy(marble.body.position);
      marble.visualGroup.quaternion.copy(marble.body.quaternion);
    }

    const intersects = raycaster.intersectObject(marble.mesh);
    if (intersects.length) {
      marble.rotator.rotation.y += 0.005;
      marble.visualGroup.rotation.y += 0.005;
      hovered = marble;
      document.body.style.cursor = 'pointer';
    }
  });

  if (!hovered) document.body.style.cursor = 'default';

  controls.update();
  renderer.render(scene, camera);
}
