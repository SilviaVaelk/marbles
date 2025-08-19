(function () {
  const THREE = window.THREE;

  class RGBELoader extends THREE.DataTextureLoader {
    constructor(manager) {
      super(manager);
      this.type = THREE.HalfFloatType;
    }

    setDataType(value) {
      this.type = value;
      return this;
    }

    load(url, onLoad, onProgress, onError) {
      return super.load(
        url,
        (buffer) => {
          const byteArray = new Uint8Array(buffer);
          // this is where real HDR decoding should happen — simplified below
          const width = 1, height = 1;
          const data = new Uint16Array([0, 0, 0, 1]); // fake RGBA pixel

          const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, this.type);
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
