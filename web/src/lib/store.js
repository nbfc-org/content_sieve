import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const sessionKeys = ['posts'];

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
  },
  actions: {
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
    }
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
