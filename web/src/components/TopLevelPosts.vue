<template>
  <div id="app">
    <div v-if="error">{{ error }}</div>
    <div class="comment-thread">
      <Post @postReply="postReply" @vote="vote" :key="`${postId}_${childrenCount}`" :thread="thread" :postId="postId" v-for="postId in postIds" />
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import uuid62 from 'uuid62';
import Post from './Post';
import { Thread } from '../lib/posts.js';
import { indexSort, postsByUser, POSTS_BY_USER, ADD_POST } from '../lib/queries.js';

const VOTE = gql`mutation ($vote: VoteInput!) {
  vote(vote: $vote) {
    postId
    votes {
      type
    }
  }
}`;

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
        postReply(event, parent, text) {
            this.addPost(parent, text);
        },
        async vote(event, postId, type) {
            try {
                const w = await this.$apollo.mutate({
                    mutation: VOTE,
                    variables: {
                        vote: {
                            postId,
                            type,
                        }
                    },
                });
                // console.info(w);
            } catch(err) {
                this.error = err;
                // console.error(this.error);
            }
        },
        addPost(parent, content) {
            const id = uuid62.v4();
            this.$apollo.mutate({
                mutation: ADD_POST,
                variables: {
                    post: {
                        postId: id,
                        body: content,
                        parentId: parent.postId,
                        index: parent.index,
                    }
                },
                update: updateAddPost.bind(this),
                optimisticResponse: {
                    __typename: 'Mutation',
                    addPost: {
                        __typename: 'Post',
                        postId: id,
                        parent: {
                            __typename: 'Post',
                            postId: parent.postId,
                        },
                        author: {
                            __typename: 'User',
                            // TODO: unhardcode this when auth exists
                            username: "foobar",
                        },
                        content: {
                            __typename: 'Text',
                            body: content,
                        },
                        votes: [],
                        createdAt: Date.now(),
                        index: [...parent.index, 0],
                    },
                },
            })
        },
    },
    computed: {
        postIds: function() {
            return this.postsByUser.postIds;
        },
        childrenCount: function() {
            return this.postsByUser.childrenCount;
        },
    },
    apollo: {
        postsByUser,
    }
}
</script>
