<template>
  <div>
    <div v-if="error">{{ error }}</div>
    <div class="comment-thread">
      <Post @reloadPost="reloadPost" :key="`${post.postId}`" :recPost="post" :postId="post.postId" v-for="post in postsWithTag" />
    </div>
  </div>
</template>
<script>
import { postsWithTag } from '../lib/queries.js';
import Post from './Post.vue';

export default {
    components: {
        Post,
    },
    data: function() {
        return {
            postsWithTag: [],
            error: null,
            version: 0,
        };
    },
    props: [
        'tag',
    ],
    methods: {
        reloadPost(cache, post) {
            this.version++;
            this.$apollo.queries.postsWithTag.refetch();
        },
    },
    apollo: {
        postsWithTag,
    },
};
</script>
