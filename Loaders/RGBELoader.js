// RGBELoader.js (patched)
// Make sure THREE is already loaded to window.THREE before this file runs

(function () {
  const THREE = window.THREE;
  class RGBELoader extends THREE.DataTextureLoader {
    constructor(manager) {
      super(manager);
      this.type = THREE.HalfFloatType;
    }

    parse(buffer) {
      // Minimal stub
      throw new Error('Patched RGBELoader: parse() not implemented. Use load().');
    }

    load(url, onLoad, onProgress, onError) {
      return super.load(
        url,
        (data) => {
          const texture = new THREE.DataTexture(data.data, data.width, data.height);
          texture.colorSpace = THREE.LinearSRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          texture.flipY = true;
          texture.needsUpdate = true;
          onLoad(texture);
        },
        onProgress,
        onError
      );
    }
  }

  window.RGBELoader = RGBELoader;
})();
