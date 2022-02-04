import { createApp as _createApp } from 'vue';

import VueKeyCloak from '@dsb-norge/vue-keycloak-js';

import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import 'vuetify/styles';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import colors from 'vuetify/lib/util/colors';

import { createApolloProvider } from '@vue/apollo-option';
import { getApolloClient } from './lib/apollo.js';

import App from './components/App.vue';
import createRouter from './lib/router.js';
import store from './lib/store.js';

import { config } from '@nbfc/shared/config.js';

function createApp(context) {

  const vuetify = createVuetify({
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
    directives,
    components,
    theme: {
      //defaultTheme: 'light',
      themes: {
        light: {
          dark: false,
          colors: {
            primary: colors.green.darken1,
            // anchor: colors.purple.darken2,
            secondary: colors.grey.darken1,
            accent: colors.shades.black,
            error: colors.red.accent3,
          },
        },
        /*
        dark: {
          primary: colors.blue.lighten3,
        },
        */
      },
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

  const app = _createApp({
    ...App,
  });

  const apolloClient = getApolloClient(context.ssr, app);
  const apolloProvider = createApolloProvider({
    defaultClient: apolloClient,
  });

  app.use(VueKeyCloak, {
    config: config.keycloak,
    logout: {
      redirectUri: window.location.origin,
    },
    init: {
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    },
    onReady: (kc) => {
      store.dispatch('loadUser', { kc });
    },
  });

  const router = createRouter(app);

  app.use(apolloProvider);
  app.use(router);
  app.use(store);
  app.use(vuetify);

  app.mount('#app');

  return {
    app,
    router,
    store,
    apolloProvider,
  };
}

export default createApp;
