export default function init({ THREE, CANNON }) {
  const canvas = document.getElementById('marble-canvas');

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0xeeeeee);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 3, 8);

  // Lights
// Ambient light (even base light)
scene.add(new THREE.AmbientLight(0xffffff, 1.0));

// Top-down directional light (main highlight)
const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// Fill light from below or side (adds soft illumination to shadowed parts)
const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
fillLight.position.set(-5, 2, -5);
scene.add(fillLight);


  // Physics world
  const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0),
  });

  // Ground plane (invisible)
  const groundBody = new CANNON.Body({
    mass: 0, // static
    shape: new CANNON.Plane(),
  });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);

  // Load marble texture
  const texture = new THREE.TextureLoader().load('assets/marble1.png');
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.MeshPhysicalMaterial({
    map: texture,
    roughness: 0.5,
    metalness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  });

  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const marbleMesh = new THREE.Mesh(geometry, material);
  marbleMesh.castShadow = true;
  scene.add(marbleMesh);

  // Create corresponding physics body
  const marbleBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Sphere(1),
    position: new CANNON.Vec3(0, 5, 0),
  });
  world.addBody(marbleBody);

  // Resize
  window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  // Animate
  function animate() {
    requestAnimationFrame(animate);
    world.step(1 / 60);

    // Sync Three.js mesh with Cannon body
    marbleMesh.position.copy(marbleBody.position);
    marbleMesh.quaternion.copy(marbleBody.quaternion);

    renderer.render(scene, camera);
  }

  animate();
}
