<template>
  <v-row justify="center">
    <v-col xl="9" lg="10" md="11" sm="12">
      <Post @reloadPost="reloadPost" :key="`${post.postId}`" :post="post" :topLevel="true" v-for="post in postsWithTag" />
    </v-col>
  </v-row>
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
