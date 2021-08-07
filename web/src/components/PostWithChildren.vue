<template>
  <div>
    <div v-if="error">{{ error }}</div>
    <div class="comment-thread">
      <Post @reloadPost="reloadPost" :key="`${postId}_${getPost.versionMap[postId]}`" :thread="thread" :postId="postId" :versionMap="getPost.versionMap" v-for="postId in getPost.postIds" />
    </div>
    hello
    {{ postId }}
  </div>
</template>
<script>
import { getPost } from '../lib/queries.js';
import { Thread } from '../lib/posts.js';
import Post from './Post';

export default {
    components: {
        Post,
    },
    data: function() {
        return {
            getPost: {
                postIds: [],
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
            // this.thread.remove(post.postId);
            this.thread = new Thread();
            this.version++;
            this.$apollo.queries.getPost.refetch();
        },
    },
    apollo: {
        getPost,
    },
};
</script>
