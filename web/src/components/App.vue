<template>
  <div id="app">
    <p class="username">{{ currentUser.username }}'s posts:</p>
    <table>
      <tr v-for="post in posts" :key="post.id">
        <td>
          {{ post.content.url ? post.content.title : post.content.body }}
        </td><td>
          {{post.id}}
        </td><td>
          {{post.parent}}
        </td><td>
          <a href="wut" v-on:click.prevent="reply(post)">reply</a>
        </td><td>
          {{ new Date(post.createdAt) }}
        </td><td>
          {{ post.depth }}
        </td><td>
          {{ post.index }}
        </td>
      </tr>
    </table>
    <div>
      <input v-model="newPostContent">
      <button @click="addPost({index: 0})">Add Post</button>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import uuid62 from 'uuid62';

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
    depth
    index
  }
}`;

const ADD_POST = gql`mutation ($content: String!, $parent: ID, $index: Int) {
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
    depth
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
    newData.sort((a, b) => a.index - b.index);

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
        reply(post) {
            this.addPost(post);
        },
        addPost(parent) {
            this.$apollo.mutate({
                mutation: ADD_POST,
                variables: { content: this.newPostContent, parent: parent.id, index: parent.index + 1 },
                update: updateAddPost.bind(this),
                optimisticResponse: {
                    __typename: 'Mutation',
                    addPost: {
                        __typename: 'Post',
                        id: uuid62.v4(),
                        parent: parent.id || uuid62.v4(),
                        content: {
                            __typename: 'Text',
                            body: this.newPostContent,
                        },
                        createdAt: new Date(),
                        depth: parent.depth + 1,
                        index: parent.index + 1,
                        userId: this.currentUser.id
                    },
                },
            })

            // this.newPostContent = ''
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

<style scoped>
</style>
