const path = require('path');
const pkg = require('./package');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const { VuetifyLoaderPlugin } = require('vuetify-loader');

module.exports = {
  entry: [
    'src/polyfills.js',
    'src/index.js'
  ],
  configureWebpack: {
    plugins: [
      new BundleAnalyzerPlugin()
    ]
  },
  output: {
    html: {
      title: pkg.productName,
      description: pkg.description,
      template: path.join(__dirname, 'index.ejs')
    },
  },
  chainWebpack(config) {
    config.plugin('VuetifyLoaderPlugin').use(VuetifyLoaderPlugin);
    config.plugin('VuetifyLoaderPlugin').tap(args => [{
      match (originalTag, { kebabTag, camelTag, path, component }) {
        if (kebabTag.startsWith('core-')) {
          return [camelTag, `import ${camelTag} from '@/components/core/${camelTag.substring(4)}.vue'`];
        }
      }
    }]);
  },
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
