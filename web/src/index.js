import Vue from 'vue';
import VueRouter from 'vue-router';

import App from './components/App.vue';
import { config } from '../../lib/config.js';

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
      uri: config.web.graphql,
    }),
  })
});

Vue.use(VueRouter);

import TopLevelPosts from './components/TopLevelPosts.vue';
import PostWithChildren from './components/PostWithChildren.vue';
import PostsWithTag from './components/PostsWithTag.vue';
import NewPost from './components/NewPost.vue';
import 'normalize.css';

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
  // { path: '/manage-products', alias: '/foobar', component: ManageProducts }
];

const router = new VueRouter({
  mode: 'history',
  routes
});

Vue.use(VueApollo);

new Vue({
  el: '#app',
  router,
  apolloProvider,
  render: h => h(App),
});
