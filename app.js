export default function init({ THREE, CANNON, RGBELoader }) {
  const canvas = document.getElementById('marble-canvas');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0xeeeeee);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 3, 8);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 1));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 5);
  scene.add(dirLight);

  // Physics world
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

  // HDRI setup
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  new RGBELoader()
    .setDataType(THREE.FloatType)
    .load('assets/zebra.hdr', function (hdrTexture) {
      const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
      scene.environment = envMap;
      hdrTexture.dispose();
      pmremGenerator.dispose();

      // Load marble texture
      const texture = new THREE.TextureLoader().load('assets/marble1.png');
      texture.colorSpace = THREE.SRGBColorSpace;

      const material = new THREE.MeshPhysicalMaterial({
        map: texture,
        roughness: 0.05,
        metalness: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        envMapIntensity: 2.5,
      });

      const geometry = new THREE.SphereGeometry(1, 64, 64);
      const marbleMesh = new THREE.Mesh(geometry, material);
      marbleMesh.castShadow = true;
      scene.add(marbleMesh);

      const marbleBody = new CANNON.Body({
        mass: 3,
        shape: new CANNON.Sphere(1),
        position: new CANNON.Vec3(0, 5, 0),
        material: marbleMaterial,
      });
      marbleBody.angularDamping = 0.4;
      marbleBody.linearDamping = 0.1;
      world.addBody(marbleBody);

      // Animate
      function animate() {
        requestAnimationFrame(animate);
        world.step(1 / 60);
        marbleMesh.position.copy(marbleBody.position);
        marbleMesh.quaternion.copy(marbleBody.quaternion);
        renderer.render(scene, camera);
      }

      animate();
    });
}
