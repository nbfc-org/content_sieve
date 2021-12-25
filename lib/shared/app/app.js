import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';

import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors';

import VueKeyCloak from '@dsb-norge/vue-keycloak-js';

import VueApollo from "vue-apollo";
import { getApolloClient } from './lib/apollo.js';

import App from './components/App.vue';
import router from './lib/router.js';
import store from './lib/store.js';

import { config } from '../config.js';

Vue.use(VueKeyCloak, {
  config: config.keycloak,
  init: {
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  },
  onReady: (kc) => {
    store.dispatch('loadUser', { kc });
  },
});

Vue.config.productionTip = false;

Vue.use(Vuetify);

function createApp(context) {

  const vuetify = new Vuetify({
    theme: {
      themes: {
        light: {
          primary: colors.green.darken1,
          // anchor: colors.purple.darken2,
          secondary: colors.grey.darken1,
          accent: colors.shades.black,
          error: colors.red.accent3,
        },
        dark: {
          primary: colors.blue.lighten3,
        },
      },
    },
    icons: {
      iconfont: 'mdiSvg',
    },
  });

  /*
  sync(store, router);

  // Vuex state restoration
  if (!context.ssr && window.__INITIAL_STATE__) {
    // We initialize the store state with the data injected from the server
    store.replaceState(window.__INITIAL_STATE__);
  }
  */

  const apolloClient = getApolloClient(context.ssr);
  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
  });

  return {
    app: new Vue({
      el: '#app',
      router,
      store,
      vuetify,
      apolloProvider,
      ...App,
    }),
    router,
    store,
    apolloProvider,
  };
}

export default createApp;
