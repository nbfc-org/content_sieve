import Vue from 'vue';

import Vuetify from 'vuetify/lib';
/*
import Vuetify, {
  VCard,
  VCardText,
  VCardActions,
  VApp,
  VAppBar,
  VToolbar,
  VToolbarItems,
  VToolbarTitle,
  VBtn,
  VRow,
  VCol,
  VItemGroup,
  VTooltip,
  VIcon,
  VMain,
  VSpacer,
  VExpandTransition,
  VContainer,
  VChip,
  VForm,
  VTextField,
  VDivider,
  VRadioGroup,
  VRadio,
  VSwitch,
  VDataTable,
} from 'vuetify/lib';
*/

import colors from 'vuetify/lib/util/colors';
import { Ripple } from 'vuetify/lib/directives';

// import VueApollo from "vue-apollo";
import { createApolloProvider } from '@vue/apollo-option';
import { getApolloClient } from './lib/apollo.js';

import App from './components/App.vue';
import router from './lib/router.js';
import store from './lib/store.js';

import { config } from '@nbfc/shared/config.js';

Vue.config.productionTip = false;

Vue.use(Vuetify, {
  directives: {
    Ripple,
  },
  /*
  components: {
    VCard,
    VCardText,
    VCardActions,
    VApp,
    VAppBar,
    VToolbar,
    VToolbarItems,
    VToolbarTitle,
    VBtn,
    VRow,
    VCol,
    VItemGroup,
    VTooltip,
    VIcon,
    VMain,
    VSpacer,
    VExpandTransition,
    VContainer,
    VChip,
    VForm,
    VTextField,
    VDivider,
    VRadioGroup,
    VRadio,
    VSwitch,
    VDataTable,
  },
  */
});

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
  const apolloProvider = createApolloProvider({
    defaultClient: apolloClient,
  });

  const app = Vue.createApp({
    store,
    vuetify,
    /*
    el: '#app',
    router,
    */
    ...App,
  });
  app.use(apolloProvider);
  app.use(router);
  // app.use(store);
  // app.use(vuetify);
  app.mount('#app');

  return {
    app,
    router,
    store,
    apolloProvider,
  };
}

export default createApp;
