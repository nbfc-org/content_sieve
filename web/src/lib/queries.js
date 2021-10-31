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
  return [{...post, children: [], nested_kids_length: kids.length}, ...kids.map(p => flattenPost(p))].flat();
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
    score
    replies
    depth
    tags {
      canonical {
        slug
      }
    }
  }
`;

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

const GET_OWN_USER_INFO = gql`
query {
  getOwnUser {
    username
    settings {
      nested
      sortType
    }
  }
}`;

const getOwnUserInfo = {
  query: GET_OWN_USER_INFO,
  update(data) {
    return data.user;
  },
};

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
                            username: "foobar",
                        },
                        content: {
                            __typename: 'Text',
                            body: content,
                        },
                        score: 0,
                        replies: 0,
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

const postsWithTag = {
  query: GET_POSTS_WITH_TAG,
  variables() {
    return {
      tli: {
        tag: this.tag,
        sortBy: this.sortType,
        page: this.page,
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
    voteId
  }
}`;

const GET_VOTES = gql`
${postFields}
query {
  votes {
    type
    date
    voteId
    post {
      ...PostFields
    }
  }
}`;

const getVotes = {
  query: GET_VOTES,
  update(data) {
    return data.votes;
  },
};


const SAVE_SETTINGS = gql`mutation ($settings: UserSettingsInput!) {
  saveSettings(settings: $settings) {
    username
  }
}`;

const saveSettings = function(apolloClient, settings) {
  return apolloClient.mutate({
    mutation: SAVE_SETTINGS,
    variables: {
      settings
    },
    update: (cache, result) => {
      // this.$emit('reloadPost', cache, result.data.vote);
    },
  });
};

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

const _newest  = (a, b) => b.createdAt - a.createdAt;
const _oldest  = (a, b) => a.createdAt - b.createdAt;
const _score   = (a, b) => b.score - a.score;
const _replies = (a, b) => b.replies - a.replies;

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
    return _replies;
  case "HIGH_SCORE":
  case 3:
    return _score;
  }
};

export {
  getPost, indexSort, postsWithTag,
  addPost, saveSettings,
  VOTE, getVotes,
  getOwnUserInfo,
  flattenPost, sortTypes, getSort,
};
