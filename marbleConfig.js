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
      thickness: 2.0
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
      thickness: 2.5
    }
  },
  {
    texture: 'assets/marble-pattern-spiral.png',
    color: '#FF5C5C',
    glb: null,
    link: 'https://example.com/project3',
    size: 0.7,
    materialOptions: {
      transmission: 0.9,
      opacity: 0.8,
      thickness: 2.5
    }
  }
];
