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

const flattenPost = (post) => {
  let kids = [];
  if (post.children) {
    kids = post.children;
  }
  return [{...post, children: []}, ...kids.map(p => flattenPost(p))].flat();
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
query ($tli: TopLevelInput!) {
  postsWithTag(tli: $tli) {
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
      tli: {
        tag: this.tag,
        sortBy: "NEWEST",
      },
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

// TODO: use introspection for sortBy
/*
  query {
  __type(name: "SortType") {
  name
  enumValues {
  name
  }
  }
  }
*/

const sortTypes = [
  "NEWEST",
  "OLDEST",
  "MOST_REPLIES",
  "HIGH_SCORE",
];

const _newest = (a, b) => b.createdAt - a.createdAt;
const _oldest = (a, b) => a.createdAt - b.createdAt;

const getSort = (sortBy) => {
  switch (sortBy) {
  case "NEWEST":
  case 0:
    return _newest;
  case "OLDEST":
  case 1:
    return _oldest;
  case "MOST_REPLIES":
  case 2:
    return _newest; // TODO: replace this
  case "HIGH_SCORE":
  case 3:
    return _newest; // TODO: replace this
  }
};

export {
  getPost, indexSort, postsByUser, postsWithTag,
  addPost, POSTS_BY_USER, VOTE,
  flattenPost, sortTypes, getSort,
};
