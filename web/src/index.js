import Vue from 'vue';

import App from './components/App.vue';
import { config } from '../../lib/config.js';
import apolloProvider from './lib/apollo.js';
import store from './lib/store.js';
import router from './lib/router.js';

import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors';

import VueKeyCloak from '@dsb-norge/vue-keycloak-js';
Vue.use(VueKeyCloak, {
  config: config.keycloak,
  init: {
    onLoad: 'check-sso',
  },
  onReady: (kc) => {
    store.dispatch('loadUser', { kc });
  },
});

Vue.config.productionTip = false;

Vue.use(Vuetify);
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

new Vue({
  el: '#app',
  router,
  store,
  vuetify,
  apolloProvider,
  render: h => h(App),
});
