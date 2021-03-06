<template>
  <v-row justify="center">
    <v-col xl="8" lg="9" md="10" cols="12">
      <Post v-if="settings.nested" @reloadPost="reloadPost" @loadMore="loadMore" :key="`${getPost.postId}`" :post="getPost" :sortBy="settings.sortType" :showReply="showReply" />
      <Post v-else @reloadPost="reloadPost" @loadMore="loadMore" :key="`${post.postId}`" :post="post" v-for="post in flatten(getPost)" :sortBy="settings.sortType" :showReply="showReply" />
    </v-col>
  </v-row>
</template>
<script>
import { getPost, getOwnUserInfo, flattenPost, getSort } from '../lib/queries.js';
import Post from './Post.vue';
import { mapState } from 'vuex';
import uuid62 from 'uuid62';

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
        'showReply',
    ],
    computed: {
        ...mapState({
            settings: state => {
                const { user } = state.session;
                if (!user) { return {}; }
                return user.settings;
            },
        }),
    },
    methods: {
        authed() {
            return this.$keycloak.ready && this.$keycloak.authenticated;
        },
        flatten(post) {
            let posts = flattenPost(post);
            if (this.settings.sortType === undefined) {
                return posts;
            }
            const first = posts.shift();
            posts.sort(getSort(this.settings.sortType));
            posts.unshift(first);
            return posts;
        },
        reloadPost(cache, post) {
            /*
            // this.thread.remove(post.postId);
            */
            this.version++;
            this.$apollo.queries.getPost.refetch({
                nonce: uuid62.v4(),
            });
        },
        loadMore(postId) {
            this.$apollo.queries.getPost.fetchMore({
                variables: {
                    postId,
                },
                updateQuery: (previousResult, { fetchMoreResult }) => {
                    const findAndSplice = (post, target) => {
                        let children = post.children || [];
                        if (post.postId === target.postId) {
                            children = target.children;
                            // TODO: this.set is broken
                            this.$set(post, 'children', children);
                        }
                        return {
                            __typename: post.__typename,
                            ...post,
                            children: children.map(c => findAndSplice(c, target)),
                        };
                    };
                    return {
                        post: findAndSplice(previousResult.post, fetchMoreResult.post),
                    };
                }
            });
        },
    },
    apollo: {
        getPost,
    },
};
</script>
