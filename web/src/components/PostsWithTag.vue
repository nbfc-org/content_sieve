<template>
  <v-row justify="center">
    <v-col xl="9" lg="10" md="11" sm="12">
      <div v-if="tag" class="text-h6">Posts tagged with: <span class="text-button">{{ tag }}</span></div>
      <Post @reloadPost="reloadPost" :key="`${post.postId}`" :post="post" :topLevel="true" v-for="post in sortedPosts" />
    </v-col>
  </v-row>
</template>
<script>
import { postsWithTag, sortTypes, getSort } from '../lib/queries.js';
import Post from './Post.vue';
import { mapState } from 'vuex';

export default {
    components: {
        Post,
    },
    props: [
        'tag',
    ],
    data: function() {
        return {
            postsWithTag: [],
        };
    },
    computed: {
        ...mapState({
            settings: state => {
                const { user } = state.session;
                if (!user) { return {}; }
                return user.settings;
            },
        }),
        sortType() {
            return sortTypes[this.settings.sortType || 0];
        },
        sortedPosts() {
            const posts = this.postsWithTag;
            if (this.settings.sortType === undefined) {
                return posts;
            }
            return [...posts.sort(getSort(this.settings.sortType))];
        },
    },
    methods: {
        reloadPost(cache, post) {
            this.$apollo.queries.postsWithTag.refetch();
        },
    },
    apollo: {
        postsWithTag,
    },
};
</script>
