import gql from 'graphql-tag'

const GET_POST = gql`query ($postId: ID!) {
  post(postId: $postId) {
    postId
  }
}`;

const getPost = {
  query: GET_POST,
  variables() {
      return {
        postId: this.postId,
      };
  },
  update: data => data.post,
};

export { getPost };
