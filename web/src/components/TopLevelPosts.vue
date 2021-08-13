<template>
  <div>
    <div v-if="error">{{ error }}</div>
    <div class="comment-thread">
      <Post @reloadPost="reloadPost" :key="`${post.postId}`" :recPost="post" :postId="post.postId" v-for="post in postsByUser" />
    </div>
  </div>
</template>

<script>
import Post from './Post.vue';
import { indexSort, postsByUser, POSTS_BY_USER } from '../lib/queries.js';

function updateAddPost(cache, result) {

    let newPost = result.data.addPost

    let cacheId = {
        query: POSTS_BY_USER,
    }

    const data = cache.readQuery(cacheId)
    const newData = [ ...data.postsByUser, newPost ]
    newData.sort(indexSort);

    cache.writeQuery({
        ...cacheId,
        data: { postsByUser: newData }
    })
};

export default {
    components: {
        Post,
    },
    data: function(){
        return {
            postsByUser: [],
            error: null,
        };
    },
    methods: {
        reloadPost(cache, post) {
            /*
            // this.thread.remove(post.postId);
            */
            this.version++;
            this.$apollo.queries.postsByUser.refetch();
        },
    },
    apollo: {
        postsByUser,
    }
}
</script>
