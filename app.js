export default function init({ THREE }) {
  const canvas = document.getElementById('marble-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x111111);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 2, 6);

  const light = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
  scene.add(light);

  const texture = new THREE.TextureLoader().load('assets/marble1.png'); // Use one of your actual marble textures
  const material = new THREE.MeshPhysicalMaterial({
    map: texture,
    roughness: 0.1,
    metalness: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  });

  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const marble = new THREE.Mesh(geometry, material);
  scene.add(marble);

  function animate() {
    requestAnimationFrame(animate);
    marble.rotation.y += 0.005;
    renderer.render(scene, camera);
  }

  animate();
}
