import gql from 'graphql-tag';
import base36 from 'base36';

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

const ADD_POST = gql`
${postFields}
mutation ($post: PostInput!) {
  addPost(post: $post) {
    ...PostFields
  }
}`;

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

const VOTE = gql`mutation ($vote: VoteInput!) {
  vote(vote: $vote) {
    postId
    votes {
      type
    }
  }
}`;

export { getPost, indexSort, postsByUser, POSTS_BY_USER, ADD_POST, VOTE };
