<template>
  <div>
    <div v-if="error">{{ error }}</div>
    <v-btn-toggle mandatory v-model="nested">
      <v-btn>
        flat
      </v-btn>
      <v-btn>
        nested
      </v-btn>
    </v-btn-toggle>
    <v-btn-toggle mandatory v-model="sortBy">
      <v-btn :key="`sortTypeBtn_${s}`" v-for="s in sortTypes">{{ s }}</v-btn>
    </v-btn-toggle>
    <div class="comment-thread">
      <Post v-if="nested" @reloadPost="reloadPost" :key="`${getPost.postId}`" :post="getPost" :sortBy="sortBy" :showReply="showReply" />
      <Post v-else @reloadPost="reloadPost" :key="`${post.postId}`" :post="post" v-for="post in flatten(getPost)" :sortBy="sortBy" :showReply="showReply" />
    </div>
  </div>
</template>
<script>
import { getPost, flattenPost, sortTypes, getSort } from '../lib/queries.js';
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
        'showReply',
    ],
    computed: {
        sortTypes: function() {
            return sortTypes;
        },
    },
    methods: {
        flatten(post) {
            const posts = flattenPost(post);
            if (this.sortBy === undefined) {
                return posts;
            }
            const first = posts.shift();
            return [first, ...posts.sort(getSort(this.sortBy))];
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
