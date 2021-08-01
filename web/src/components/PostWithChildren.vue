<template>
  <div>
    <div v-if="error">{{ error }}</div>
    <div class="comment-thread">
      <Post :key="`${postId}_${childrenCount}`" :thread="thread" :postId="postId" v-for="postId in postIds" />
    </div>
    hello
    {{ postId }}
  </div>
</template>
<script>
import { getPost } from '../lib/queries.js';
import { Thread } from '../lib/posts.js';
import Post from './Post';

// TODO: add back postReply and vote
// <Post @postReply="postReply" @vote="vote" :key="`${postId}_${childrenCount}`" :thread="thread" :postId="postId" v-for="postId in postIds" />
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
        };
    },
    props: [
        'postId',
    ],
    computed: {
        postIds: function() {
            return this.getPost.postIds;
        },
        childrenCount: function() {
            return this.getPost.childrenCount;
        },
    },
    apollo: {
        getPost,
    },
};
</script>
