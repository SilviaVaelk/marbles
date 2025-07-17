export default function init({ THREE }) {
  const canvas = document.getElementById('marble-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0xeeeeee); // light gray background for better visibility

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 2, 6);

  const light1 = new THREE.DirectionalLight(0xffffff, 1);
  light1.position.set(5, 10, 7);
  scene.add(light1);

  const light2 = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(light2);

  const texture = new THREE.TextureLoader().load('assets/marble1.png'); // <- Use your real image
  const material = new THREE.MeshPhysicalMaterial({
    map: texture,
    roughness: 0.1,
    metalness: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  });

  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const marble = new THREE.Mesh(geometry, material);
  marble.position.set(0, 1.5, 0); // raise it so it's centered in camera
  scene.add(marble);

  function animate() {
    requestAnimationFrame(animate);
    marble.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  animate();
}
