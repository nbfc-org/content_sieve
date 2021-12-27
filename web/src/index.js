import Vue from 'vue';
import store from '@nbfc/shared/app/lib/store.js';
import { config } from '@nbfc/shared/config.js';

import createApp from '@nbfc/shared/app/app';

import VueKeyCloak from '@dsb-norge/vue-keycloak-js';

Vue.use(VueKeyCloak, {
  config: config.keycloak,
  logout: {
    redirectUri: window.location.origin,
  },
  init: {
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  },
  onReady: (kc) => {
    createApp({
      ssr: false,
    });
    store.dispatch('loadUser', { kc });
  },
});
