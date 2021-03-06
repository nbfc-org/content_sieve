import { createRouter as _createRouter, createWebHistory } from 'vue-router';
import { toRaw } from 'vue';

import PostWithChildren from '../components/PostWithChildren.vue';
import PostsWithTag from '../components/PostsWithTag.vue';
import NotFoundComponent from '../components/NotFoundComponent.vue';
// import NewPost from '../components/NewPost.vue';
// import Settings from '../components/Settings.vue';
import Profile from '../components/Profile.vue';
import MetaVote from '../components/MetaVote.vue';

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
  { path: '/presite/',
    alias: '/',
    component: PostsWithTag,
    props: true,
  },
  { path: '/tag/:tag',
    component: PostsWithTag,
    props: true,
  },
  { path: '/user/profile',
    component: Profile,
    meta: {
      isAuthenticated: true
    },
  },
  /*
  { path: '/user/settings',
    component: Settings,
    props: true,
  },
  */
  { path: '/user/metavote',
    component: MetaVote,
    props: true,
    meta: {
      isAuthenticated: true,
      roles: ['admin'],
    },
  },
  /*
  {
    path: '/new',
    component: NewPost,
    meta: {
      isAuthenticated: true
    },
  },
  */
  {
    path: '/:pathMatch(.*)*',
    component: NotFoundComponent,
    name: 'NotFound'
  },
];

const scrollBehavior = (to, from, savedPosition) => {
  if (to.hash) {
    setTimeout(() => {
      const element = document.getElementById(to.hash.replace(/#/, ''));
      if (element && element.scrollIntoView) {
        element.scrollIntoView({block: 'start', behavior: 'smooth'});
      }
    }, 100);

    //NOTE: This doesn't work for Vue 3
    //return {selector: to.hash}

    //This does
    return {el: to.hash};
  }
  else if (savedPosition) {
    return savedPosition;
  }
  return {top: 0};
};

const createRouter = (app) => {
  const router = _createRouter({
    history: createWebHistory(),
    scrollBehavior,
    routes
  });

  router.beforeEach((to, from, next) => {
    if (to.meta.isAuthenticated) {
      // Get the actual url of the app, it's needed for Keycloak
      const basePath = window.location.toString();
      const kc = (app && app.config) ? app.config.globalProperties.$keycloak : {};
      const { ready, authenticated } = {...kc};

      if (ready && authenticated) {
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
      } else if (ready && !authenticated) {
        // The page is protected and the user is not authenticated. Force a login.
        kc.login({ redirectUri: window.location.origin + to.path });
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

  return router;
};

export default createRouter;
