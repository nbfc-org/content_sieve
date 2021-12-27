import { defineConfig } from "vite";
// import vue from '@vitejs/plugin-vue' // vue 3
import { createVuePlugin as vue } from "vite-plugin-vue2"; //vue 2
const path = require("path");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      external: [
        "vue",
        "vuex",
        "vue-router",
        "vuetify/lib",
        "vuetify/lib/util/colors",
        "vue-apollo",
        "apollo-client",
        "apollo-cache-inmemory",
        "apollo-link-context",
        "apollo-link-http",
        "apollo-link-error",
        "graphql-tag",
        "graphql/language/printer",
        "graphql/language/visitor",
        "base36",
        "uuid62",
        "@mdi/js",
        "vue-infinite-loading",
        "lodash-es",
        "luxon",
        "pluralize",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
