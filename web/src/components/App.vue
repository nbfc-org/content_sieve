<template>
  <div id="app">
    <p class="username">{{ currentUser.username }}'s posts:</p>
    <div class="comment-thread">
      <Post @postReply="postReply" v-for="post in posts" :key="post.id" v-bind:post="post" />
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import uuid62 from 'uuid62';
import Post from './Post';

const CURRENT_USER = gql`query {
  currentUser {
    id
    username
  }
}`;

const POSTS_BY_USER = gql`query ($userId: String!) {
  postsByUser(userId: $userId) {
    id
    content {
      ... on Text {
        body
      }
      ... on Link {
        url
        title
      }
    }
    parent
    createdAt
    index
  }
}`;

const ADD_POST = gql`mutation ($content: String!, $parent: ID, $index: String) {
  addPost(content: $content, parent: $parent, index: $index) {
    id
    content {
      ... on Text {
        body
      }
      ... on Link {
        url
        title
      }
    }
    parent
    createdAt
    index
  }
}`;

function updateAddPost(cache, result) {

    let newPost = result.data.addPost

    let cacheId = {
        query: POSTS_BY_USER,
        variables: { userId: this.currentUser.id },
    }

    const data = cache.readQuery(cacheId)
    const newData = [ ...data.postsByUser, newPost ]
    newData.sort((a, b) => {
        return a.index.localeCompare(b.index) || b.createdAt - a.createdAt;
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
            currentUser: { username: 'user' },
            posts: [],
        };
    },
    methods: {
        postReply(event, parent, text) {
            this.addPost(parent, text);
        },
        addPost(parent, content) {
            this.$apollo.mutate({
                mutation: ADD_POST,
                variables: { content, parent: parent.id, index: parent.index },
                update: updateAddPost.bind(this),
                optimisticResponse: {
                    __typename: 'Mutation',
                    addPost: {
                        __typename: 'Post',
                        id: uuid62.v4(),
                        parent: parent.id || uuid62.v4(),
                        content: {
                            __typename: 'Text',
                            body: content,
                        },
                        createdAt: Date.now(),
                        index: `${parent.index}:0`,
                        userId: this.currentUser.id
                    },
                },
            })
        },
    },
    apollo: {
        currentUser: CURRENT_USER,
        posts: {
            query: POSTS_BY_USER,
            variables() {
                return { userId: this.currentUser.id }
            },
            update(data) {
                return data.postsByUser
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
  .replies {
      margin-left: 20px;
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
