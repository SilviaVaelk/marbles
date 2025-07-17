export default function init({ THREE }) {
  const canvas = document.getElementById('marble-canvas');

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0xeeeeee); // light gray background

  // Scene and camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 2, 6);

  // Lighting
  const light1 = new THREE.DirectionalLight(0xffffff, 1);
  light1.position.set(5, 10, 7);
  scene.add(light1);

  const light2 = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(light2);

  // Texture
const texture = new THREE.TextureLoader().load('assets/marble1.png');
texture.colorSpace = THREE.SRGBColorSpace;



  // Material
  const material = new THREE.MeshPhysicalMaterial({
    map: texture,
    roughness: 0.5,
    metalness: 0.5,
    clearcoat: 0.5,
    clearcoatRoughness: 0.05,
  });

  // Geometry and mesh
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const marble = new THREE.Mesh(geometry, material);
  marble.position.set(0, 1.5, 0);
  scene.add(marble);

  // Resize handling
  window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    marble.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  animate();
}
