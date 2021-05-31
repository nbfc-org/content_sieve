<template>
  <div id="app">
    <p class="username">{{ currentUser.username }}'s posts:</p>
    <ul>
      <li v-for="post in posts" :key="post.id">{{ post.content.url ? post.content.title : post.content.body }}</li>
    </ul>
    <div>
      <input v-model="newPostContent">
      <button @click="addPost()">Add Post</button>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'

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
  }
}`;

const ADD_POST = gql`mutation ($content: String!) {
  addPost(content: $content) {
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

    cache.writeQuery({
        ...cacheId,
        data: { postsByUser: newData }
    })
};

export default {
    name: 'app',
    data: function(){
        return {
            currentUser: { username: 'user' },
            posts: [],
            newPostContent: ''

        }
    },
    methods: {
        addPost() {
            this.$apollo.mutate({
                mutation: ADD_POST,
                variables: { content: this.newPostContent },
                update: updateAddPost.bind(this),
                optimisticResponse: {
                    __typename: 'Mutation',
                    addPost: {
                        __typename: 'Post',
                        id: 'xyz-?',
                        content: {
                            __typename: 'Text',
                            body: this.newPostContent,
                        },
                        userId: this.currentUser.id
                    },
                },
            })

            this.newPostContent = ''
        }
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

<!-- Global CSS -->
<style>
  code {
    font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif;
    font-size: 0.9em;
    white-space: pre-wrap;
    color: #2c3e50;
  }

  code::before, code::after {
    content: '`';
  }
</style>

<!-- Scoped component css -->
<!-- It only affect current component -->
<style scoped>
  #app {
    text-align: center;
  }

  #app h1 {
    color: #2c3e50;
    font-weight: 300;
    margin: 0;
  }

  .banner {
    height: 200px;
    background-color: #f6f6f6;
    padding: 50px 10px;
  }

  .bottom {
    padding: 80px 10px;
    font-size: 24px;
    font-weight: 300;
  }

  .fade {
    font-size: 14px;
  }

  .logo {
    animation: spin 4s 1s infinite linear
  }

  @keyframes spin {
    from {transform:rotate(0deg);}
    to {transform:rotate(360deg);}
  }
</style>
