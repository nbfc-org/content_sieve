import { ApolloServer, gql } from 'apollo-server';

import uuid62 from 'uuid62';

import { data } from './posts.mjs';

const schema = gql(`
  type Query {
    currentUser: User
    postsByUser(userId: String!): [Post]
  }

  type Mutation {
    addPost(content: String!, parent: ID, index: String): Post
  }

  type User {
    id: ID!
    username: String!
    posts: [ID]
    karma: Int
  }

  type Text {
    body: String!
  }

  type Link {
    url: String!
    title: String
  }

  union Content = Link | Text

  type Post {
    id: ID!
    content: Content!
    userId: ID!
    createdAt: Float!
    parent: ID
    replies: [ID]
    tags: [ID]
    score: Int
    index: String
  }

  type Tag {
    id: ID!
    slug: String!
    createdAt: Float!
    posts: [ID]
  }

  enum VoteType {
    UP,
    DOWN,
    FLAG,
    SAVE,
    HIDE,
  }

  type Vote {
    id: ID!
    type: VoteType!
    createdAt: Float!
    userId: ID!
    postId: ID!
  }
`);

var resolvers = {
    Query: {
        currentUser: (_, __, { data, currentUserId }) => {
            let user = data.users.find( u => u.id === currentUserId );
            return user;
        },
        postsByUser: (_, { userId }, { data }) => {
            let posts = data.thread.toArray().filter( p => p.userId === userId );
            return posts;
        },
    },
    Mutation: {
        addPost: async (_, { content, parent, index }, { currentUserId, data }) => {
            let post = {
                id: uuid62.v4(),
                content: {
                    body: content,
                },
                userId: currentUserId,
                createdAt: Date.now(),
            };
            return data.thread.reply(parent, post, index);
        }
    },
    User: {
        posts: (parent, __, { data }) => {
            let posts = data.thread.toArray().filter( p => p.userId === userId );
            return posts;
        }
    },
    Content: {
        __resolveType(obj, context, info){
            if(obj.hasOwnProperty('body')) {
                return 'Text';
            }
            if(obj.hasOwnProperty('url')) {
                return 'Link';
            }
            return null;
        },
    },
};

const currentUserId = 'abc-1';

const server = new ApolloServer({
    typeDefs: schema,
    resolvers: resolvers,
    context: {
        currentUserId,
        data
    }
});

server.listen(4001).then(({ url }) => {
    console.log('API server running at localhost:4001');
});
