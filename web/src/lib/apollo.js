import Vue from 'vue';
import VueApollo from "vue-apollo";

import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context'
import { HttpLink } from 'apollo-link-http';

import { config } from '../../../lib/config.js';

import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import introspectionQueryResultData from '../../fragmentTypes.json';

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
      console.error(err);
      /*
        switch (err.extensions.code) {
        case 'UNAUTHENTICATED':
        console.error(err);
        }
      */
    }
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});

const link = authLink.concat(errorLink).concat(httpLink);

export const apolloClient = new ApolloClient({
  cache,
  link,
  // connectToDevTools: true,
});

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
});

Vue.use(VueApollo);

export default apolloProvider;
