import gql from 'graphql-tag';
import base36 from 'base36';
import uuid62 from 'uuid62';

const cmp = (a, b) => {
  if (a < b) { return -1; }
  if (a > b) { return 1; }
  return 0;
};

const b36 = (a) => a.map(i => base36.base36encode(i).padStart(4, "0")).join(':');

const indexSort = (a, b) => {
  return cmp(b36(a.index), b36(b.index)) || a.createdAt - b.createdAt;
};


const postFields = gql`
  fragment PostFields on Post {
    postId
    content {
      ... on Text {
        rendered
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
    author {
      username
    }
    votes {
      type
    }
    tags {
      canonical {
        slug
      }
    }
  }
`;

const POSTS_BY_USER = gql`
${postFields}
query {
  postsByUser {
    ...PostFields
    children {
      ...PostFields
      children {
        ...PostFields
        children {
          ...PostFields
          children {
            ...PostFields
          }
        }
      }
    }
  }
}`;

const GET_POST_RECURSIVE = gql`
${postFields}
query ($postId: ID!) {
  post(postId: $postId) {
    ...PostFields
    children {
      ...PostFields
      children {
        ...PostFields
        children {
          ...PostFields
          children {
            ...PostFields
          }
        }
      }
    }
  }
}`;

const GET_POSTS_WITH_TAG = gql`
${postFields}
query ($tag: String!) {
  postsWithTag(tag: $tag) {
    ...PostFields
  }
}`;

const ADD_POST = gql`
${postFields}
mutation ($post: PostInput!) {
  addPost(post: $post) {
    ...PostFields
  }
}`;

const addPost = function(event, input) {
  const id = uuid62.v4();

  return this.$apollo.mutate({
    mutation: ADD_POST,
    variables: {
      post: {
        postId: id,
        ...input,
      }
    },
    update: (cache, result) => {
      this.$emit('reloadPost', cache, parent);
    },
  });

  /*
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
                    },
                },
  */
};

const getPost = {
  query: GET_POST_RECURSIVE,
  variables() {
    return {
      postId: this.postId,
    };
  },
  update(data) {
    return data.post;
  },
};

const postsByUser = {
  query: POSTS_BY_USER,
  update(data) {
    const posts = data.postsByUser;
    return posts;
  },
};

const postsWithTag = {
  query: GET_POSTS_WITH_TAG,
  variables() {
    return {
      tag: this.tag,
    };
  },
  update(data) {
    const posts = data.postsWithTag;
    return posts;
  },
};

const VOTE = gql`mutation ($vote: VoteInput!) {
  vote(vote: $vote) {
    postId
    votes {
      type
    }
  }
}`;

export { getPost, indexSort, postsByUser, postsWithTag, addPost, POSTS_BY_USER, VOTE };
