export default function init({ THREE }) {
  const canvas = document.getElementById('marble-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 5;

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  const light = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
  scene.add(light);

  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  animate();
}
