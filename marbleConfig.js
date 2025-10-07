// marbleConfig.js
export const MARBLE_CONFIGS = [
  {
    color: '#d9d9ff',
    glb: 'assets/inner-model.glb',
    link: 'https://example.com/project1',
    size: 1,
    materialOptions: {
      transmission: 0.9,
      opacity: 0.85,
      thickness: 2.0,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01
    }
  },
  
  {
    color: '#ffeedd',
    glb: 'assets/inner-model-5.glb',
    link: 'https://example.com/project2',
    size: 1.2,
    materialOptions: {
      transmission: 0.95,
      opacity: 0.8,
      thickness: 2.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01
    }
  },
  
  {
    texture: 'assets/marble-pattern-spiral-abstract.png',
    color: '#cccccc',
    lightColor: 0xff66cc,
    glb: null,
    link: 'https://example.com/project3',
    size: 0.6,
    materialOptions: {
      transmission: 0.95,
      opacity: 0.2,
      thickness: 5,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01
    }
  }
];
