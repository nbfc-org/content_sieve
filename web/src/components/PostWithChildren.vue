<template>
  <div>
    <div v-if="error">{{ error }}</div>
    <div class="comment-thread">
      <Post @reloadPost="reloadPost" :key="`${getPost.postId}`" :recPost="getPost" :postId="getPost.postId" v-if="getPost.postId" />
    </div>
  </div>
</template>
<script>
import { getPost } from '../lib/queries.js';
import Post from './Post';

export default {
    components: {
        Post,
    },
    data: function() {
        return {
            getPost: {
                postId: null,
            },
            error: null,
            version: 0,
        };
    },
    props: [
        'postId',
    ],
    methods: {
        reloadPost(cache, post) {
            /*
            // this.thread.remove(post.postId);
            */
            this.version++;
            this.$apollo.queries.getPost.refetch();
        },
    },
    apollo: {
        getPost,
    },
};
</script>
