<template>
  <div id="app">
    <div class="comment-thread">
      <Post @postReply="postReply" :key="`${postId}_${childrenCount}`" :thread="thread" :postId="postId" v-for="postId in postIds" />
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import uuid62 from 'uuid62';
import Post from './Post';
import { Thread } from '../../../api/src/posts.js';

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
  }
}`;

function updateAddPost(cache, result) {

    let newPost = result.data.addPost

    let cacheId = {
        query: POSTS_BY_USER,
    }

    const data = cache.readQuery(cacheId)
    const newData = [ ...data.postsByUser, newPost ]
    newData.sort((a, b) => {
        return a.index.localeCompare(b.index) || a.createdAt - b.createdAt;
    });

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
        };
    },
    methods: {
        postReply(event, parent, text) {
            this.addPost(parent, text);
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
                        content: {
                            __typename: 'Text',
                            body: content,
                        },
                        createdAt: Date.now(),
                        index: `${parent.index}:00`,
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
                posts.sort((a, b) => {
                    return a.index.localeCompare(b.index) || a.createdAt - b.createdAt;
    });
                let parents = [];
                // const start = Date.now();
                const postIds = [];
                for (let i = 0; i < posts.length; i++) {
                    const c = posts[i];
                    c.id = c.postId;
                    let p = parents.length ? posts[parents[parents.length - 1]] : undefined;
                    if (!p) {
                        postIds.push(c.postId);
                    }
                    try {
                        this.thread.reply(p ? p.postId : undefined, c, p ? p.index : undefined);
                    } catch (err) {
                        console.error(err);
                    }

                    if (i + 1 < posts.length) {
                        let n = posts[i + 1];
                        if (n.index.length > c.index.length) {
                            parents.push(i);
                        } else if (n.index.length < c.index.length) {
                            const num = c.index.split(':').length - n.index.split(':').length;
                            for (let j = 0; j < num; j++) {
                                parents.pop();
                            }
                        }
                    }
                }
                // console.log(`rerender: ${Date.now() - start}`);
                return { postIds, childrenCount: posts.length - 1 };
            },
        },
    }
}
</script>

<!-- CSS libraries -->
<style src="normalize.css/normalize.css"></style>

<style>

  button {
      -moz-appearance: none;
      -webkit-appearance: none;
      appearance: none;
      font-size: 14px;
      padding: 4px 8px;
      color: rgba(0, 0, 0, 0.85);
      background-color: #fff;
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-radius: 4px;
  }
  button:hover,
  button:focus,
  button:active {
      cursor: pointer;
      background-color: #ecf0f1;
  }
  .comment-thread {
      width: 700px;
      max-width: 100%;
      margin: auto;
      padding: 0 30px;
      background-color: #fff;
      border: 1px solid transparent; /* Removes margin collapse */
  }
  .m-0 {
      margin: 0;
  }
  .sr-only {
      position: absolute;
      left: -10000px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
  }

  /* Comment */

  .comment {
      position: relative;
      margin: 20px auto;
  }
  .comment-heading {
      display: flex;
      align-items: center;
      height: 50px;
      font-size: 14px;
  }
  .comment-voting {
      width: 20px;
      height: 32px;
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-radius: 4px;
  }
  .comment-voting button {
      display: block;
      width: 100%;
      height: 50%;
      padding: 0;
      border: 0;
      font-size: 10px;
  }
  .comment-info {
      color: rgba(0, 0, 0, 0.5);
      margin-left: 10px;
  }
  .comment-author {
      color: rgba(0, 0, 0, 0.85);
      font-weight: bold;
      text-decoration: none;
  }
  .comment-author:hover {
      text-decoration: underline;
  }

  /* Adjustments for the comment border links */

  .comment-border-link {
      display: block;
      position: absolute;
      top: 50px;
      left: 0;
      width: 12px;
      height: calc(100% - 50px);
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      background-color: rgba(0, 0, 0, 0.1);
      background-clip: padding-box;
  }
  .comment-border-link:hover {
      background-color: rgba(0, 0, 0, 0.3);
  }
  .comment-body {
      padding: 0 20px;
      padding-left: 28px;
  }
  .replies {
      margin-left: 28px;
  }

  /* Adjustments for toggleable comments */

  details.comment summary {
      position: relative;
      list-style: none;
      cursor: pointer;
  }
  details.comment summary::-webkit-details-marker {
      display: none;
  }
  details.comment:not([open]) .comment-heading {
      border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  }
  .comment-heading::after {
      display: inline-block;
      position: absolute;
      right: 5px;
      align-self: center;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.55);
  }
  details.comment[open] .comment-heading::after {
      content: "Click to hide";
  }
  details.comment:not([open]) .comment-heading::after {
      content: "Click to show";
  }

  /* Adjustment for Internet Explorer */

  @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
      /* Resets cursor, and removes prompt text on Internet Explorer */
      .comment-heading {
          cursor: default;
      }
      details.comment[open] .comment-heading::after,
      details.comment:not([open]) .comment-heading::after {
          content: " ";
      }
  }

  /* Styling the reply to comment form */

  .reply-form textarea {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      font-size: 16px;
      width: 100%;
      max-width: 100%;
      margin-top: 15px;
      margin-bottom: 5px;
  }
  .d-none {
      display: none;
  }
</style>
