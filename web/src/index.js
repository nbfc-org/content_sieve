import Vue from 'vue';

import VueRouter from 'vue-router';

import App from './components/App.vue';
import { config } from '../../lib/config.js';
import store from './lib/store.js';

import VueKeyCloak from '@dsb-norge/vue-keycloak-js';
Vue.use(VueKeyCloak, {
  config: config.keycloak,
  init: {
    onLoad: 'check-sso',
  },
});

Vue.config.productionTip = false;

import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context'
import { HttpLink } from 'apollo-link-http';
import VueApollo from "vue-apollo";

import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import introspectionQueryResultData from '../fragmentTypes.json';

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData,
});

const cache = new InMemoryCache({ fragmentMatcher });

const httpLink = new HttpLink({
  uri: config.web.graphql,
});

const authLink = setContext(async (_, { headers }) => {
  let authorizationHeader = {};

  const kc = Vue.prototype.$keycloak;
  if (kc && kc.authenticated) {
    const token = kc.token;
    authorizationHeader = {
        authorization: `Bearer ${token}`,
    };
  }
  return {
    headers: {
      ...headers,
      ...authorizationHeader,
    },
  };
});

import { onError } from "apollo-link-error";

const errorLink = onError(({ graphQLErrors, networkError, response, operation }) => {
  /*
    if (operation.operationName === "IgnoreErrorsQuery") {
      response.errors = null;
    }
    */
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      switch (err.extensions.code) {
      case 'UNAUTHENTICATED':
        console.error(err);
      }
    }
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});

const link = authLink.concat(errorLink).concat(httpLink);

const apolloProvider = new VueApollo({
  defaultClient: new ApolloClient({
    cache,
    link,
    // connectToDevTools: true,
  })
});

Vue.use(VueRouter);

import TopLevelPosts from './components/TopLevelPosts.vue';
import PostWithChildren from './components/PostWithChildren.vue';
import PostsWithTag from './components/PostsWithTag.vue';
import NotFoundComponent from './components/NotFoundComponent.vue';
import NewPost from './components/NewPost.vue';
// import 'normalize.css';

const routes = [
  { path: '/tree', component: TopLevelPosts },
  { path: '/post/:postId',
    component: PostWithChildren,
    props: true,
  },
  { path: '/tag/all',
    alias: '/',
    component: PostsWithTag,
    props: true,
  },
  { path: '/tag/:tag',
    component: PostsWithTag,
    props: true,
  },
  {
    path: '/new',
    component: NewPost,
  },
  {
    path: '/:catchAll(.*)',
    component: NotFoundComponent,
    name: 'NotFound'
  },
];

const router = new VueRouter({
  mode: 'history',
  routes
});

Vue.use(VueApollo);

const vuetify = new Vuetify({
  theme: { disable: true },
});

new Vue({
  el: '#app',
  router,
  store,
  vuetify,
  apolloProvider,
  render: h => h(App),
});
