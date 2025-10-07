// marbleConfig.js
export const MARBLE_CONFIGS = [
  {
    color: '#d9d9ff',
    glb: 'assets/inner-model.glb',
    link: 'https://example.com/project1',
    size: 1
  },
  {
    color: '#ffeedd',
    glb: 'assets/inner-model-5.glb',
    link: 'https://example.com/project2',
    size: 1.2
  },
  {
    color: '#92F5B5',
    glb: null,
    link: 'https://example.com/project3',
    size: 0.7,
    materialOptions: {
      transmission: 0.95,
      opacity: 0.8,
      thickness: 4.5
    }
  }
];
