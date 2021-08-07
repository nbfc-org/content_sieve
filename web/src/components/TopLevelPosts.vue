<template>
  <div id="app">
    <div v-if="error">{{ error }}</div>
    <div class="comment-thread">
      <Post @reloadPost="reloadPost" :key="`${postId}_${postsByUser.versionMap[postId]}`" :thread="thread" :postId="postId" :versionMap="postsByUser.versionMap" v-for="postId in postsByUser.postIds" />
    </div>
  </div>
</template>

<script>
import Post from './Post';
import { Thread } from '../lib/posts.js';
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
    name: 'app',
    components: {
        Post,
    },
    data: function(){
        return {
            postsByUser: {
                postIds: [],
            },
            thread: new Thread(),
            error: null,
        };
    },
    methods: {
        reloadPost(cache, post) {
            // this.thread.remove(post.postId);
            this.thread = new Thread();
            this.version++;
            this.$apollo.queries.postsByUser.refetch();
        },
    },
    apollo: {
        postsByUser,
    }
}
</script>
