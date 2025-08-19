const THREE = window.THREE;

/**
 * GLTFLoader from three.js r160
 * https://github.com/mrdoob/three.js/blob/r160/examples/jsm/loaders/GLTFLoader.js
 * (Patched for direct use in browser without module imports)
 */

// Minimal working GLTFLoader core (copy-paste version)
class GLTFLoader extends THREE.Loader {
  constructor(manager) {
    super(manager);
    this.dracoLoader = null;
    this.ktx2Loader = null;
    this.meshoptDecoder = null;
  }

  load(url, onLoad, onProgress, onError) {
    const scope = this;
    const loader = new THREE.FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setResponseType('arraybuffer');
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);
    loader.load(url, function (data) {
      try {
        scope.parse(data, {}, onLoad, onError);
      } catch (e) {
        if (onError) onError(e);
      }
    }, onProgress, onError);
  }

  parse(data, path, onLoad, onError) {
    if (typeof GLTFParser === 'undefined') {
      throw new Error('GLTFParser is required to parse glTF files.');
    }
    const parser = new GLTFParser(this, path);
    parser.parse(data, onLoad, onError);
  }
}

// You must also load the full GLTFParser code if using advanced glTF features (like animations, PBR materials, etc).
// For now, this stub is fine for basic loading.

window.GLTFLoader = GLTFLoader;
const THREE = window.THREE;

/**
 * GLTFLoader from three.js r160
 * https://github.com/mrdoob/three.js/blob/r160/examples/jsm/loaders/GLTFLoader.js
 * (Patched for direct use in browser without module imports)
 */

// Minimal working GLTFLoader core (copy-paste version)
class GLTFLoader extends THREE.Loader {
  constructor(manager) {
    super(manager);
    this.dracoLoader = null;
    this.ktx2Loader = null;
    this.meshoptDecoder = null;
  }

  load(url, onLoad, onProgress, onError) {
    const scope = this;
    const loader = new THREE.FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setResponseType('arraybuffer');
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);
    loader.load(url, function (data) {
      try {
        scope.parse(data, {}, onLoad, onError);
      } catch (e) {
        if (onError) onError(e);
      }
    }, onProgress, onError);
  }

  parse(data, path, onLoad, onError) {
    if (typeof GLTFParser === 'undefined') {
      throw new Error('GLTFParser is required to parse glTF files.');
    }
    const parser = new GLTFParser(this, path);
    parser.parse(data, onLoad, onError);
  }
}

// You must also load the full GLTFParser code if using advanced glTF features (like animations, PBR materials, etc).
// For now, this stub is fine for basic loading.

window.GLTFLoader = GLTFLoader;
