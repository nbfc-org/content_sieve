import Vue from 'vue';

import App from './components/App.vue';
import { config } from '../../lib/config.js';
import apolloProvider from './lib/apollo.js';
import store from './lib/store.js';
import router from './lib/router.js';

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

import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);
const vuetify = new Vuetify({
  theme: { disable: true },
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
