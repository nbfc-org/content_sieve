import Vue from 'vue';
import VueApollo from "vue-apollo";

import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import { HttpLink } from 'apollo-link-http';
import { onError } from "apollo-link-error";

import { config } from '../../config.js';

import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import introspectionQueryResultData from '../fragmentTypes.json';

Vue.use(VueApollo);

let _apolloClient = undefined;

export function getApolloClient(ssr=false) {

  if( !_apolloClient) {

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

    /*
    // If on the client, recover the injected state
    if (!ssr) {
      if (typeof window !== 'undefined') {
        const state = window.__APOLLO_STATE__;
        if (state) {
          // If you have multiple clients, use `state.<client_id>`
          cache.restore(state.defaultClient);
        }
      }
    }
    */

    _apolloClient = new ApolloClient({
      cache,
      link,
        /*
      // connectToDevTools: true,
      ...(ssr ? {
        // Set this on the server to optimize queries when SSR
        ssrMode: true,
      } : {
        // This will temporary disable query force-fetching
        ssrForceFetchDelay: 100,
      }),
      */
    });
  }
  return _apolloClient;
}
