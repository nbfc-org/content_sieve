import { defineConfig } from "vite";
// import vue from '@vitejs/plugin-vue' // vue 3
import { createVuePlugin as vue } from "vite-plugin-vue2"; //vue 2
const path = require("path");

import { minifyHtml, injectHtml } from 'vite-plugin-html';
import legacy from '@vitejs/plugin-legacy';
import { esbuildCommonjs } from '@originjs/vite-plugin-commonjs';

import viteComponents, {
  VuetifyResolver,
} from 'vite-plugin-components';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 4000,
  },
  plugins: [
    vue(),
    minifyHtml(),
    viteComponents({
      customComponentResolvers: [
        VuetifyResolver(),
      ],
    }),
    injectHtml({
      injectData: {
        html: {
          title: 'ProjectName',
          description: 'A single page application created using Vue.js',
        },
      },
    }),
    legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),
  ],
  build: {
    rollupOptions: {
    },
  },
  optimizeDeps:{
    include: [
      'uuid62',
      'base-x',
      'base36',
      'hash.js',
      'hash.js/lib/hash/sha/256',
    ],
    /*
      <script>window.require = () => {}</script>
      <script>window.global = window;</script>
    esbuildOptions:{
      plugins:[
        esbuildCommonjs([
          // 'hash.js/lib/hash/sha/256',
          // 'hash.js/lib/hash/sha/256',
          // 'crypto',
          // 'buffer',
        ])
      ]
    }
    */
  },
  resolve: {
    // extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
