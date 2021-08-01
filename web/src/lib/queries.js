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
`;

const POSTS_BY_USER = gql`
${postFields}
query {
  postsByUser {
    ...PostFields
  }
}`;

const GET_POST = gql`
${postFields}
query ($postId: ID!) {
  postWithChildren(postId: $postId) {
    ...PostFields
  }
}`;

const insertIntoThread = (posts, thread) => {
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
      thread.reply(p ? p.postId : undefined, c, p ? p.index : []);
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
};

const getPost = {
  query: GET_POST,
  variables() {
      return {
        postId: this.postId,
      };
  },
  update(data) {
    const posts = data.postWithChildren;
    posts.sort(indexSort);
    return insertIntoThread(posts, this.thread);
  },
};

const postsByUser = {
  query: POSTS_BY_USER,
  update(data) {
    const posts = data.postsByUser;
    posts.sort(indexSort);
    return insertIntoThread(posts, this.thread);
  },
};

export { getPost, indexSort, postsByUser, POSTS_BY_USER };
