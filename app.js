import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './loaders/RGBELoader.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18/+esm';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('marble-canvas');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff);
renderer.toneMappingExposure = 1.5; // try values between 1.2 - 2.0


const scene = new THREE.Scene();

let hovered = false;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let marbleMesh;
let rotator = new THREE.Group(); // <-- child group for visual rotation

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3, 8);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.target.set(0, 1, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// Physics
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });

const marbleMaterial = new CANNON.Material();
const groundMaterial = new CANNON.Material();
const contactMaterial = new CANNON.ContactMaterial(marbleMaterial, groundMaterial, {
  friction: 0.4,
  restitution: 0.6,
});
world.addContactMaterial(contactMaterial);

const groundBody = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Plane(),
  material: groundMaterial,
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

// HDR environment
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

new RGBELoader()
  .setDataType(THREE.UnsignedByteType) // ✅ Avoid HalfFloat error
  .load('assets/zebra.hdr', function (hdrTexture) {
    const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
    scene.environment = envMap;
    hdrTexture.dispose();
    pmremGenerator.dispose();

    // Marble appearance
    // const texture = new THREE.TextureLoader().load('assets/dotted.svg');
    // texture.colorSpace = THREE.SRGBColorSpace;

const normalMap = new THREE.TextureLoader().load('assets/marble-normal.jpg');
normalMap.colorSpace = THREE.NoColorSpace; // normals are not color data

const material = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#2B1CFF'),
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



    // GUI
    const gui = new GUI();
    const materialParams = {
      roughness: material.roughness,
      metalness: material.metalness,
      transmission: material.transmission,
      clearcoat: material.clearcoat,
      clearcoatRoughness: material.clearcoatRoughness,
      envMapIntensity: material.envMapIntensity
    };

    gui.add(materialParams, 'roughness', 0, 1).onChange(v => material.roughness = v);
    gui.add(materialParams, 'metalness', 0, 1).onChange(v => material.metalness = v);
    gui.add(materialParams, 'transmission', 0, 1).onChange(v => material.transmission = v);
    gui.add(materialParams, 'clearcoat', 0, 1).onChange(v => material.clearcoat = v);
    gui.add(materialParams, 'clearcoatRoughness', 0, 1).onChange(v => material.clearcoatRoughness = v);
    gui.add(materialParams, 'envMapIntensity', 0, 5).onChange(v => material.envMapIntensity = v);

    // Marble mesh and rotator
    marbleMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), material);
    marbleMesh.castShadow = true;
    marbleMesh.add(rotator); // <- add child for inner contents
    const outerGroup = new THREE.Group();
    outerGroup.add(marbleMesh);
    scene.add(outerGroup);


    // Light inside marble
    const innerLight = new THREE.PointLight(0xffffff, 1.5, 3);
    innerLight.position.set(0, 0, 0);
    rotator.add(innerLight);

    // Load GLB model
    const loader = new GLTFLoader();
    loader.load('assets/DamagedHelmet.glb', (gltf) => {
      const innerObject = gltf.scene;
      innerObject.scale.set(0.4, 0.4, 0.4);
      innerObject.position.set(0, 0, 0);

      innerObject.traverse(child => {
        if (child.isMesh) {
          child.material.envMapIntensity = 2.5;
          child.material.needsUpdate = true;
        }
      });

      rotator.add(innerObject); // add to child group
    });

    // Physics body
    const marbleBody = new CANNON.Body({
      mass: 3,
      shape: new CANNON.Sphere(1),
      position: new CANNON.Vec3(0, 5, 0),
      material: marbleMaterial,
    });
    marbleBody.angularDamping = 0.4;
    marbleBody.linearDamping = 0.1;
    world.addBody(marbleBody);

    // Mouse Events
    window.addEventListener('mousemove', (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('click', () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(marbleMesh);
      if (intersects.length > 0) {
        window.open('https://example.com', '_blank');
      }
    });

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      world.step(1 / 60);

      marbleMesh.position.copy(marbleBody.position);
      marbleMesh.quaternion.copy(marbleBody.quaternion);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(marbleMesh);
      hovered = intersects.length > 0;

if (hovered) {
  rotator.rotation.y += 0.005;      // inner GLB
  outerGroup.rotation.y += 0.005;  // outer marble
}
 else {
        document.body.style.cursor = 'default';
      }

      controls.update();
      renderer.render(scene, camera);
    }

    animate();
  });
