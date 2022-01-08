<template>
  <v-row justify="center">
    <v-col xl="8" lg="9" md="10" cols="12">
      <div v-if="tag" class="text-h6">Posts tagged with: <span class="text-button">{{ tag }}</span></div>
      <Post @reloadPost="reloadPost" :key="`${post.postId}`" :post="post" :topLevel="true" v-for="post in sortedPosts" />
    </v-col>
  </v-row>
</template>
<script>
import { postsWithTag, sortTypes, getSort } from '../lib/queries.js';
import Post from './Post.vue';
import { mapState } from 'vuex';
import InfiniteLoading from 'vue-infinite-loading';
import { delay } from 'lodash-es';
import uuid62 from 'uuid62';

// TODO: reenable infinite loading
// https://github.com/ts-pro/vue-eternal-loading
// <infinite-loading v-if="!$apollo.loading" @infinite="loadMore"></infinite-loading>
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
            lastPage: false,
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
            let posts = this.postsWithTag;
            if (!this.settings.sortType) {
                return posts;
            }
            posts = [...posts];
            posts.sort(getSort(this.settings.sortType));
            return posts;
        },
    },
    methods: {
        authed() {
            return this.$keycloak.ready && this.$keycloak.authenticated;
        },
        reloadPost(cache, post) {
            this.$apollo.queries.postsWithTag.refetch({
                nonce: uuid62.v4(),
            });
        },
        loadMore($state) {
            if (this.lastPage) {
                $state.loaded();
                $state.complete();
                return;
            }
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
                    const len = fetchMoreResult.postsWithTag.length;
                    if (len) {
                        delay($state.loaded, 4000);
                    } else {
                        this.lastPage = true;
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
