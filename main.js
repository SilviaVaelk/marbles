export default function init({ THREE, CANNON, OrbitControls }) {
  const canvas = document.getElementById('marble-canvas');

  // === SCENE ===
  const scene = new THREE.Scene();

  // === CAMERA ===
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 5, 12);

  // === RENDERER ===
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;

  // === LIGHTING ===
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  scene.add(ambientLight, directionalLight);

  // === PHYSICS WORLD ===
  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);

  // === GROUND PLANE ===
  const groundMaterial = new CANNON.Material();
  const groundBody = new CANNON.Body({
    mass: 0,
    material: groundMaterial,
    shape: new CANNON.Plane(),
  });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);

  // === DATA: PROJECT MARBLES ===
  const projects = [
    {
      texture: 'assets/marble1.jpg',
      link: 'https://yoursite.com/project1',
    },
    {
      texture: 'assets/marble2.jpg',
      link: 'https://yoursite.com/project2',
    },
    {
      texture: 'assets/marble3.jpg',
      link: 'https://yoursite.com/project3',
    },
  ];

  const marbles = [];
  const marbleBodies = [];
  const marbleRadius = 1;

  const loader = new THREE.TextureLoader();

  projects.forEach((proj, i) => {
    const tex = loader.load(proj.texture);
    tex.anisotropy = 16;

    const marbleMat = new THREE.MeshPhysicalMaterial({
      map: tex,
      roughness: 0.1,
      metalness: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });

    const marbleGeo = new THREE.SphereGeometry(marbleRadius, 64, 64);
    const marbleMesh = new THREE.Mesh(marbleGeo, marbleMat);
    marbleMesh.castShadow = true;
    scene.add(marbleMesh);

    const x = (Math.random() - 0.5) * 6;
    const y = 8 + Math.random() * 3;
    const z = (Math.random() - 0.5) * 6;

    const body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Sphere(marbleRadius),
      position: new CANNON.Vec3(x, y, z),
      material: new CANNON.Material(),
    });

    world.addBody(body);

    marbles.push({ mesh: marbleMesh, link: proj.link });
    marbleBodies.push(body);
  });

  // === CLICK HANDLER ===
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(marbles.map(m => m.mesh));

    if (intersects.length > 0) {
      const clicked = marbles.find(m => m.mesh === intersects[0].object);
      if (clicked) window.location.href = clicked.link;
    }
  }

  window.addEventListener('click', onClick);

  // === RESIZE HANDLING ===
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // === ANIMATION LOOP ===
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
