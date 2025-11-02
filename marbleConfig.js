// marbleConfig.js
export const MARBLE_CONFIGS = [
  {
    title: "[Digital painting]",
    description: 'When left unsupervised with a colour picker. <a href="https://www.silviavaelk.com/digital-painting" target="_blank">Take a look</a>',
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
    description: 'Exploring visuals and motion through trial and error. <a href="https://www.silviavaelk.com/experiments" target="_blank">Click here</a>',
    color: '#ffffff',
    lightColor: 0xff66cc,
    glb: 'assets/inner-model-5.glb',
    size: 1.2,
    materialOptions: {
      transmission: 0.95,
      opacity: 0.8,
      thickness: 2.5,
      roughness: 0.5,
      clearcoat: 2.0,
      clearcoatRoughness: 0.01
    }
  },
  
  {
    title: "[Slit-scanner]",
    description: 'Experimental tool to play around with time and motion distortion. <a href="https://www.silviavaelk.com/slit-scanner" target="_blank">Try it</a>',
    texture: 'assets/marble-pattern-spiral-abstract.png',
    color: '#ff99cc',
    lightColor: 0xff66cc,
    glb: null,
    size: 0.6,
    materialOptions: {
      transmission: 0.1,
      opacity: 1.0,
      thickness: 0.5,
      roughness: 0.1,
      clearcoat: 1.5,
      clearcoatRoughness: 0.1
    }
  }
];
