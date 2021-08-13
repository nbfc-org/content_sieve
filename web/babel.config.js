module.exports = {
  presets: [
    ['poi/babel', {
      jsx: 'vue',
      plugins: ["@babel/plugin-proposal-private-methods", { "loose": true }],
      transformModules: [
        'uuid62',
        'base-x',
        'base36',
      ],
    }]
  ]
};
