import Vue from 'vue';
import VueRouter from 'vue-router';

import TopLevelPosts from '../components/TopLevelPosts.vue';
import PostWithChildren from '../components/PostWithChildren.vue';
import PostsWithTag from '../components/PostsWithTag.vue';
import NotFoundComponent from '../components/NotFoundComponent.vue';
import NewPost from '../components/NewPost.vue';

Vue.use(VueRouter);

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

export default router;
