// marbleConfig.js
export const MARBLE_CONFIGS = [
  {
    title: "[Digital painting]",
    description: 'When I\'m left unsupervised with a colour picker. <a href="https://www.silviavaelk.com/digital-painting" target="_blank">Click here</a>.',
    color: '#d9d9ff',
    lightColor: 0xff66cc,
    glb: 'assets/inner-model.glb',
    size: 1,
    materialOptions: {
      transmission: 0.9,
      opacity: 0.85,
      thickness: 2.0,
      roughness: 0.1,
      clearcoat: 2.0,
      clearcoatRoughness: 0.1
    }
  },
  
  {
    title: "[Experiments]",
    description: "Snippets with Cavalry, Blender, etc.",
    link: 'https://example.com/project2',
    color: '#000000',
    lightColor: 0xff66cc,
    glb: 'assets/inner-model-5.glb',
    size: 1.2,
    materialOptions: {
      transmission: 0.95,
      opacity: 0.8,
      thickness: 2.5,
      roughness: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01
    }
  },
  
  {
    title: "[Slit-scanner]",
    description: "Experimental tool to achieve the slit-scan effect",
    link: 'https://example.com/project3',
    texture: 'assets/marble-pattern-spiral-abstract.png',
    color: '#ff99cc',
    lightColor: 0xff66cc,
    glb: null,
    size: 0.6,
    materialOptions: {
      transmission: 0.3,
      opacity: 0.9,
      thickness: 5,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01
    }
  }
];
