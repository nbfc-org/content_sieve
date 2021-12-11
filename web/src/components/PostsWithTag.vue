<template>
  <v-row justify="center">
    <v-col xl="8" lg="9" md="10" cols="12">
      <div v-if="tag" class="text-h6">Posts tagged with: <span class="text-button">{{ tag }}</span></div>
      <Post @reloadPost="reloadPost" :key="`${post.postId}`" :post="post" :topLevel="true" v-for="post in sortedPosts" />
      <infinite-loading @infinite="loadMore"></infinite-loading>
    </v-col>
  </v-row>
</template>
<script>
import { postsWithTag, sortTypes, getSort } from '../lib/queries.js';
import Post from './Post.vue';
import { mapState } from 'vuex';
import InfiniteLoading from 'vue-infinite-loading';
import { delay } from 'lodash-es';

export default {
    components: {
        Post,
        InfiniteLoading,
    },
    props: [
        'tag',
    ],
    data: function() {
        return {
            postsWithTag: [],
            page: 0,
            nextPage: 1,
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
        authed() {
            return this.$keycloak.ready && this.$keycloak.authenticated;
        },
        reloadPost(cache, post) {
            this.$apollo.queries.postsWithTag.refetch();
        },
        loadMore($state) {
            this.$apollo.queries.postsWithTag.fetchMore({
                variables: {
                    tli: {
                        tag: this.tag,
                        sortBy: this.sortType,
                        page: this.page + this.nextPage,
                    },
                },
                updateQuery: (previousResult, { fetchMoreResult }) => {
                    this.nextPage++;
                    if (fetchMoreResult.postsWithTag.length) {
                        delay($state.loaded, 4000);
                    } else {
                        delay($state.complete, 4000);
                    }
                    return {
                        postsWithTag: [
                            ...previousResult.postsWithTag,
                            ...fetchMoreResult.postsWithTag,
                        ]
                    };
                }
            });
        },
    },
    apollo: {
        postsWithTag,
    },
};
</script>
