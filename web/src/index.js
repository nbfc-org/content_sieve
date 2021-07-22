import Vue from 'vue';
import App from './components/App.vue';

Vue.config.productionTip = false;

import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import VueApollo from "vue-apollo";

import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import introspectionQueryResultData from '../fragmentTypes.json';

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData,
});

const cache = new InMemoryCache({ fragmentMatcher });

const apolloProvider = new VueApollo({
  defaultClient: new ApolloClient({
    cache,
    link: new HttpLink({
      uri: 'http://localhost:4002',
    }),
  })
});

Vue.use(VueApollo);

new Vue({
  el: '#app',
  apolloProvider,
  render: h => h(App),
});
