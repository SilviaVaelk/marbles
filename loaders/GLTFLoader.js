(function () {
  const THREE = window.THREE;

  class GLTFLoader extends THREE.Loader {
    load(url, onLoad, onProgress, onError) {
      const loader = new THREE.FileLoader(this.manager);
      loader.setResponseType('arraybuffer');
      loader.load(url, (data) => {
        try {
          const scene = new THREE.Group(); // stub
          onLoad({ scene });              // mock success
        } catch (e) {
          if (onError) onError(e);
        }
      }, onProgress, onError);
    }
  }

  window.GLTFLoader = GLTFLoader;
})();
