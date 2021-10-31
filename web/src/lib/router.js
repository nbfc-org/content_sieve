import Vue from 'vue';
import VueRouter from 'vue-router';

import PostWithChildren from '../components/PostWithChildren.vue';
import PostsWithTag from '../components/PostsWithTag.vue';
import NotFoundComponent from '../components/NotFoundComponent.vue';
import NewPost from '../components/NewPost.vue';
import MetaVote from '../components/MetaVote.vue';

Vue.use(VueRouter);

const routes = [
  { path: '/post/:postId',
    component: PostWithChildren,
    props: route => ({
      showReply: route.query.showReply === 'true',
      postId: route.params.postId,
    }),
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
  { path: '/user/metavote',
    component: MetaVote,
    props: true,
    meta: {
      isAuthenticated: true,
      roles: ['admin'],
    },
  },
  {
    path: '/new',
    component: NewPost,
    meta: {
      isAuthenticated: true
    },
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

router.beforeEach((to, from, next) => {
  if (to.meta.isAuthenticated) {
    // Get the actual url of the app, it's needed for Keycloak
    const basePath = window.location.toString();
    const kc = Vue.prototype.$keycloak;


    if (kc.ready && kc.authenticated) {
      const roles = to.meta.roles;
      if (roles) {
        let role_match = false;
        for (const role of roles) {
          if (kc.hasResourceRole(role)) {
            role_match = true;
          }
        }
        if (role_match) {
          next();
        } else {
          next({ name: 'NotFound' });
        }
      } else {
        next();
      }
    } else if (kc.ready && !kc.authenticated) {
      // The page is protected and the user is not authenticated. Force a login.
      kc.login({ redirectUri: basePath.slice(0, -1) + to.path });
    } else {
      // The user was authenticated, but did not have the correct role
      // Redirect to an error page
      next({ name: 'NotFound' });
    }
  } else {
    // This page did not require authentication
    next();
  }
});

export default router;
