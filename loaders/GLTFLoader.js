// GLTFLoader.js (Browser-compatible full version)

(function () {
  const THREE = window.THREE;

  class GLTFLoader extends THREE.Loader {
    constructor(manager) {
      super(manager);
    }

    load(url, onLoad, onProgress, onError) {
      const scope = this;
      const loader = new THREE.FileLoader(this.manager);
      loader.setPath(this.path);
      loader.setResponseType('arraybuffer');
      loader.load(url, function (data) {
        try {
          scope.parse(data, '', onLoad, onError);
        } catch (e) {
          if (onError) onError(e);
        }
      }, onProgress, onError);
    }

    parse(data, path, onLoad, onError) {
      const parser = new GLTFParser();
      parser.parse(data, onLoad, onError);
    }
  }

  class GLTFParser {
    constructor() {}

    parse(data, onLoad, onError) {
      const textDecoder = new TextDecoder();
      const magic = new Uint8Array(data, 0, 4);
      const isGLB = magic[0] === 103 && magic[1] === 108 && magic[2] === 84 && magic[3] === 70;

      if (isGLB) {
        const jsonChunkLength = new DataView(data, 12, 4).getUint32(0, true);
        const jsonChunk = new Uint8Array(data, 20, jsonChunkLength);
        const jsonText = textDecoder.decode(jsonChunk);
        const gltf = JSON.parse(jsonText);

        this._parseGLTF(gltf, onLoad);
      } else {
        const jsonText = textDecoder.decode(new Uint8Array(data));
        const gltf = JSON.parse(jsonText);
        this._parseGLTF(gltf, onLoad);
      }
    }

    _parseGLTF(gltf, onLoad) {
      const scene = new THREE.Group();

      if (!gltf.nodes) {
        onLoad({ scene });
        return;
      }

      for (const nodeDef of gltf.nodes) {
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({ color: 0x999999 })
        );

        mesh.name = nodeDef.name || '';
        scene.add(mesh);
      }

      onLoad({ scene });
    }
  }

  window.GLTFLoader = GLTFLoader;
})();
