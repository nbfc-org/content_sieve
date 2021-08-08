<template>
  <div>
    <div v-if="error">{{ error }}</div>
    <div class="comment-thread">
      <Post @reloadPost="reloadPost" :key="`${getPostRecursive.postId}`" :recPost="getPostRecursive" :thread="thread" :postId="getPostRecursive.postId" v-if="getPostRecursive.postId" />
    </div>
  </div>
</template>
<script>
import { getPostRecursive } from '../lib/queries.js';
import { Thread } from '../lib/posts.js';
import Post from './Post';

export default {
    components: {
        Post,
    },
    data: function() {
        return {
            getPostRecursive: {
                postId: null,
            },
            thread: new Thread(),
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
            this.thread = new Thread();
            */
            this.version++;
            this.$apollo.queries.getPostRecursive.refetch();
        },
    },
    apollo: {
        getPostRecursive,
    },
};
</script>
