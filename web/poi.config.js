const path = require('path');
const pkg = require('./package');

module.exports = {
  entry: [
    'src/polyfills.js',
    'src/index.js'
  ],
  /*
  babel: {
  },
  */
  /*
    // moved
  html: {
    title: pkg.productName,
    description: pkg.description,
    template: path.join(__dirname, 'index.ejs')
  },
  */
  plugins: [
    { resolve: 'poi-preset-babel-minify'},
    { resolve: 'poi-preset-bundle-report' },
    { resolve: 'poi-preset-offline',
      options: {
        pwa: './src/pwa.js', // Path to pwa runtime entry
        pluginOptions: {} // Additional options for offline-plugin
      },
    },
  ]
};
