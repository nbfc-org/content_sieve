<template>
  <v-row justify="center">
    <v-col xl="8" lg="9" md="10" cols="12">
      <div v-if="tag" class="text-h6">Posts tagged with: <span class="text-button">{{ tag }}</span></div>
<Post @reloadPost="reloadPost" :key="`${post.postId}`" :post="post" :topLevel="true" v-for="post in sortedPosts" />
    </v-col>
    <v-col xl="2" lg="2" md="2" cols="12">
      <Settings />
    </v-col>
  </v-row>
</template>
<script>
import { postsWithTag, sortTypes, getSort } from '../lib/queries.js';
import Post from './Post.vue';
import { mapState } from 'vuex';
import Settings from '../components/Settings.vue';

export default {
    components: {
        Post,
        Settings,
    },
    props: [
        'tag',
    ],
    data: function() {
        return {
            postsWithTag: [],
            page: 0,
            nextPage: 1,
            hasMore: true,
            bottom: false,
        };
    },
    created() {
        window.addEventListener('scroll', () => {
            this.bottom = this.bottomVisible()
        });
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
    watch: {
        bottom(bottom) {
            if (bottom && this.hasMore) {
                this.loadMore();
            }
        }
    },
    methods: {
        bottomVisible() {
            const scrollY = window.scrollY
            const visible = document.documentElement.clientHeight
            const pageHeight = document.documentElement.scrollHeight
            const bottomOfPage = visible + scrollY >= pageHeight
            return bottomOfPage || pageHeight < visible
        },
        reloadPost(cache, post) {
            this.$apollo.queries.postsWithTag.refetch();
        },
        loadMore() {
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
                    if (!fetchMoreResult.postsWithTag.length) {
                        this.hasMore = false;
                    }
                    this.bottom = false;
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
