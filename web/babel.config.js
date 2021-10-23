module.exports = {
  presets: [
    ['poi/babel', {
      jsx: 'vue',
      plugins: [
        ["@babel/plugin-proposal-private-methods", { "loose": true }],
        ["@babel/plugin-proposal-class-properties", { "loose": true }],
        ["@babel/plugin-proposal-private-property-in-object", { "loose": true }],
      ],
      transformModules: [
        'uuid62',
        'base-x',
        'base36',
      ],
    }]
  ],
};
