<template>
  <div>
    <div v-if="error">{{ error }}</div>
    <v-btn-toggle v-model="nested">
      <v-btn>
        flat
      </v-btn>
      <v-btn>
        nested
      </v-btn>
    </v-btn-toggle>
    <v-btn-toggle v-model="sortBy">
      <v-btn>NEWEST</v-btn>
      <v-btn>OLDEST</v-btn>
      <v-btn>most replies</v-btn>
      <v-btn>high score</v-btn>
    </v-btn-toggle>
    <div class="comment-thread">
      <Post v-if="nested" @reloadPost="reloadPost" :key="`${getPost.postId}`" :post="getPost" />
      <Post v-else @reloadPost="reloadPost" :key="`${post.postId}`" :post="post" v-for="post in flatten(getPost)" />
    </div>
  </div>
</template>
<script>
import { getPost, flattenPost } from '../lib/queries.js';
import Post from './Post.vue';

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
            nested: 1,
            sortBy: 0,
        };
    },
    props: [
        'postId',
    ],
    methods: {
        flatten(post) {
            return flattenPost(post);
        },
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
