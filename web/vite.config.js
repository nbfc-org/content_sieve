import { defineConfig } from "vite";
import vue from '@vitejs/plugin-vue'; // vue 3
// import { createVuePlugin as vue } from "vite-plugin-vue2"; //vue 2
import * as path from 'path';

import { minifyHtml, injectHtml } from 'vite-plugin-html';
import legacy from '@vitejs/plugin-legacy';
import { esbuildCommonjs } from '@originjs/vite-plugin-commonjs';

import Vuetify from '@vuetify/vite-plugin';
import pkg from './package.json';

import analyze from 'rollup-plugin-analyzer';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 4000,
  },
  define: {
    'process.env': process.env,
  },
  plugins: [
    Vuetify({ autoImport: true }),
    vue(),
    minifyHtml(),
    injectHtml({
      injectData: {
        html: {
          title: pkg.productName,
          description: pkg.description,
        },
      },
    }),
    /*
    legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),
    */
  ],
  build: {
    polyfillModulePreload: false,
    rollupOptions: {
      // external: ['vuetify/lib/directives'],
      plugins: [analyze()],
      /*
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("apollo")) {
              return "apollo";
            } else if (id.includes("graphql")) {
              return "apollo";
            } else if (id.includes("marked")) {
              return "texteditor";
            } else if (id.includes("dompurify")) {
              return "texteditor";
            }
            return "vendor"; // all other package goes here
          }
        },
      },
      */
    },
  },
  // css: { preprocessorOptions: { scss: { charset: false } } },
  /*
  build: {
    rollupOptions: {
      // external: 'buffer',
    },
    commonjsOptions: {},
    //     include: [/uuid62/, /node_modules/]
    },
  },
  */
  optimizeDeps:{
    /*
    exclude: [
      '@vuetify/loader-shared/runtime',
      'vuetify',
    ],
    */
    include: [
      'uuid62',
      'base-x',
      'base36',
      'buffer',
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
