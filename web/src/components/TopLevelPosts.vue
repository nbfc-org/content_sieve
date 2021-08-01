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
import base36 from 'base36';
import Post from './Post';
import { Thread } from '../posts.js';

const POSTS_BY_USER = gql`query {
  postsByUser {
    postId
    content {
      ... on Text {
        body
      }
      ... on Link {
        url
        title
      }
    }
    parent {
      postId
    }
    createdAt
    index
    author {
      username
    }
    votes {
      type
    }
  }
}`;

const ADD_POST = gql`mutation ($post: PostInput!) {
  addPost(post: $post) {
    postId
    content {
      ... on Text {
        body
      }
      ... on Link {
        url
        title
      }
    }
    parent {
      postId
    }
    createdAt
    index
    author {
      username
    }
  }
}`;

const VOTE = gql`mutation ($vote: VoteInput!) {
  vote(vote: $vote) {
    postId
    votes {
      type
    }
  }
}`;

const cmp = (a, b) => {
    if (a < b) { return -1; }
    if (a > b) { return 1; }
    return 0;
};

const b36 = (a) => a.map(i => base36.base36encode(i).padStart(4, "0")).join(':');

const indexSort = (a, b) => {
    return cmp(b36(a.index), b36(b.index)) || a.createdAt - b.createdAt;
};

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
        postsByUser: {
            query: POSTS_BY_USER,
            update(data) {
                const posts = data.postsByUser;
                // const start = Date.now();
                posts.sort(indexSort);
                // console.log(`rerender: ${Date.now() - start}`);
                let parents = [];
                const postIds = [];
                for (let i = 0; i < posts.length; i++) {
                    const c = posts[i];
                    c.id = c.postId;
                    let p = parents.length ? posts[parents[parents.length - 1]] : undefined;
                    if (!p) {
                        postIds.push(c.postId);
                    }
                    try {
                        this.thread.reply(p ? p.postId : undefined, c, p ? p.index : []);
                    } catch (err) {
                        console.error(err);
                    }

                    if (i + 1 < posts.length) {
                        let n = posts[i + 1];
                        if (n.index.length > c.index.length) {
                            parents.push(i);
                        } else if (n.index.length < c.index.length) {
                            const num = c.index.length - n.index.length;
                            for (let j = 0; j < num; j++) {
                                parents.pop();
                            }
                        }
                    }
                }
                return { postIds, childrenCount: posts.length - 1 };
            },
        },
    }
}
</script>
