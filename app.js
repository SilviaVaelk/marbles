import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './loaders/RGBELoader.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18/+esm';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.target.set(0, 1, 0); // Focus on the marble



const canvas = document.getElementById('marble-canvas');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xeeeeee);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3, 8);

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
  .setDataType(THREE.HalfFloatType)
  .load('assets/zebra.hdr', function (hdrTexture) {
    const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
    scene.environment = envMap;
    hdrTexture.dispose();
    pmremGenerator.dispose();

    // Marble appearance
    const texture = new THREE.TextureLoader().load('assets/marble1.png');
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshPhysicalMaterial({
      map: texture,
      transparent: true,
      roughness: 0.1,
      metalness: 0,
      transmission: 0.9,
      thickness: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      envMapIntensity: 2.5,
    });

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


    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const marbleMesh = new THREE.Mesh(geometry, material);
    marbleMesh.castShadow = true;
    scene.add(marbleMesh);

    // Add light inside marble (optional)
    const innerLight = new THREE.PointLight(0xffffff, 1.5, 3);
    innerLight.position.set(0, 0, 0);
    marbleMesh.add(innerLight);

    // Load GLB model inside
    const loader = new GLTFLoader();
    loader.load('assets/DamagedHelmet.glb', (gltf) => {
      const innerObject = gltf.scene;
      innerObject.scale.set(0.4, 0.4, 0.4);
      innerObject.position.set(0, 0, 0);

      // Optional: adjust materials
      innerObject.traverse(child => {
        if (child.isMesh) {
          child.material.envMapIntensity = 2.5;
          child.material.needsUpdate = true;
        }
      });

      marbleMesh.add(innerObject);
    });

    // Add physics body
    const marbleBody = new CANNON.Body({
      mass: 3,
      shape: new CANNON.Sphere(1),
      position: new CANNON.Vec3(0, 5, 0),
      material: marbleMaterial,
    });
    marbleBody.angularDamping = 0.4;
    marbleBody.linearDamping = 0.1;
    world.addBody(marbleBody);

    function animate() {
      requestAnimationFrame(animate);
      world.step(1 / 60);
      marbleMesh.position.copy(marbleBody.position);
      marbleMesh.quaternion.copy(marbleBody.quaternion);
      renderer.render(scene, camera);
    }

    animate();
    controls.update();
  });
