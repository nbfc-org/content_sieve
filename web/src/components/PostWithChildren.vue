<template>
  <div>
    <div v-if="error">{{ error }}</div>
    <div class="comment-thread">
      <Post v-if="settings.nested" @reloadPost="reloadPost" :key="`${getPost.postId}`" :post="getPost" :sortBy="settings.sortType" :showReply="showReply" />
      <Post v-else @reloadPost="reloadPost" :key="`${post.postId}`" :post="post" v-for="post in flatten(getPost)" :sortBy="settings.sortType" :showReply="showReply" />
    </div>
  </div>
</template>
<script>
import { getPost, getOwnUserInfo, flattenPost, getSort } from '../lib/queries.js';
import Post from './Post.vue';
import { mapState } from 'vuex';

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
        flatten(post) {
            const posts = flattenPost(post);
            if (this.settings.sortType === undefined) {
                return posts;
            }
            const first = posts.shift();
            return [first, ...posts.sort(getSort(this.settings.sortType))];
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
