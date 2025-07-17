export default function init({ THREE, CANNON, OrbitControls }) {
  const canvas = document.getElementById('marble-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 5, 12);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 5);
  scene.add(ambientLight, directionalLight);

  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);

  const groundBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane(),
  });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);

  const loader = new THREE.TextureLoader();
  const marbleRadius = 1;
  const projects = [
    { texture: 'assets/marble1.png', link: '#' },
    { texture: 'assets/marble2.png', link: '#' },
    { texture: 'assets/marble3.png', link: '#' },
  ];

  const marbles = [];
  const marbleBodies = [];

  projects.forEach(({ texture, link }) => {
    const tex = loader.load(texture);
    const mat = new THREE.MeshPhysicalMaterial({
      map: tex,
      roughness: 0.1,
      metalness: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(marbleRadius, 64, 64), mat);
    scene.add(mesh);

    const body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Sphere(marbleRadius),
      position: new CANNON.Vec3(
        (Math.random() - 0.5) * 6,
        8 + Math.random() * 3,
        (Math.random() - 0.5) * 6
      ),
    });
    world.addBody(body);

    marbles.push({ mesh, link });
    marbleBodies.push(body);
  });

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(marbles.map(m => m.mesh));
    if (intersects.length > 0) {
      const clicked = marbles.find(m => m.mesh === intersects[0].object);
      if (clicked) window.location.href = clicked.link;
    }
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    world.step(1 / 60);
    marbleBodies.forEach((body, i) => {
      marbles[i].mesh.position.copy(body.position);
      marbles[i].mesh.quaternion.copy(body.quaternion);
    });
    renderer.render(scene, camera);
  }

  animate();
}
