import { defineConfig } from "vite";
import vue from '@vitejs/plugin-vue' // vue 3
// import { createVuePlugin as vue } from "vite-plugin-vue2"; //vue 2
import * as path from 'path';

import { minifyHtml, injectHtml } from 'vite-plugin-html';
import legacy from '@vitejs/plugin-legacy';
import { esbuildCommonjs } from '@originjs/vite-plugin-commonjs';

import pkg from './package.json';

import analyze from 'rollup-plugin-analyzer';

import viteComponents, {
  VuetifyResolver,
} from 'vite-plugin-components';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 4000,
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          compatConfig: {
            MODE: 3,
            GLOBAL_EXTEND: true,
            GLOBAL_OBSERVABLE: true,
            GLOBAL_PROTOTYPE: true,
            INSTANCE_EVENT_HOOKS: true,
            RENDER_FUNCTION: true,
            INSTANCE_LISTENERS: true,
            INSTANCE_SCOPED_SLOTS: true,
            COMPONENT_FUNCTIONAL: true,
            PROPS_DEFAULT_THIS: true,
            OPTIONS_DATA_MERGE: true,
            OPTIONS_BEFORE_DESTROY: true,
            OPTIONS_DESTROYED: true,
            ATTR_FALSE_VALUE: true,
            CUSTOM_DIR: true,
            INSTANCE_SET: true,
            WATCH_ARRAY: true,
          },
        },
      },
    }),
    minifyHtml(),
    viteComponents({
      customComponentResolvers: [
        VuetifyResolver(),
      ],
    }),
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
      vue: '@vue/compat',
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
