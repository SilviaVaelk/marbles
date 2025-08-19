const THREE = window.THREE;

// Simple GLTFLoader using real module under the hood
class GLTFLoader {
  constructor(manager) {
    this.loader = new THREE.FileLoader(manager);
    this.loader.setResponseType('arraybuffer');
  }

  load(url, onLoad, onProgress, onError) {
    this.loader.load(url, (data) => {
      const blob = new Blob([data], { type: 'model/gltf-binary' });
      const objectURL = URL.createObjectURL(blob);
      const gltfLoader = new THREE.ObjectLoader();

      gltfLoader.load(objectURL, (gltf) => {
        URL.revokeObjectURL(objectURL);
        onLoad({ scene: gltf });
      }, onProgress, onError);
    }, onProgress, onError);
  }
}

window.GLTFLoader = GLTFLoader;
