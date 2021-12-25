import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import { getApolloClient } from './apollo.js';

import { getOwnUserInfo, saveSettings } from './queries.js';

const sessionKeys = ['user'];

const loadFromSession = (key, context) => {
  const s = sessionStorage.getItem(key);
  if (s && typeof s === 'string' && s !== '') {
    const data = JSON.parse(s);
    context.commit('set', {key, data});
    return data;
  }
  return {};
};

const storeToSession = (key, context, data) => {
  sessionStorage.setItem(key, JSON.stringify(data));
  context.commit('set', {key, data});
};

export default new Vuex.Store({
  state: {
    token: '',
    userid: '',
    user_type: 0,
    postOverrides: {},
    session: {},
  },
  getters: {
    getPost: (state) => (postId) => {
      const posts = state.session.posts;
      return posts && posts[postId] ? posts[postId] : undefined;
    },
    // const storePost = this.$store.getters.getPost(this.postId);
  },
  actions: {
    async loadUser(context, { kc }) {
      loadFromSession('user', context);
      if (kc.authenticated) {
        const response = await getApolloClient().query(getOwnUserInfo);
        const data = response.data.getOwnUser;
        context.commit('set', { key: 'user', data });
      }
    },
    async saveSettings(context, { kc, settings }) {
      const { user } = context.state.session;
      storeToSession('user', context, { ...user, settings });
      if (kc.authenticated) {
        try {
          await saveSettings(getApolloClient(), settings);
        } catch(err) {
          // this.error = err;
          console.error(err);
        }
      }
    },
    postShowReply(context, { postId, showReply }) {
      const posts = loadFromSession('posts', context);
      posts[postId] = { showReply };
      storeToSession('posts', context, posts);
    },
    getSession(context) {
      for (const k of sessionKeys) {
        loadFromSession(k, context);
      }
    },
    logoutSession(context) {
      context.commit('logoutSession');
    },

  },
  mutations: {
    set(state, {key, data}) {
      state.session = { ...state.session, [key]: data };
    },
    logoutSession(state) {
      sessionStorage.clear();
      state.session = {};
    }
  }
});
