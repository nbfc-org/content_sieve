import { ApolloServer, gql } from 'apollo-server';
import data from './posts.mjs';

const schema = gql(`
  type Query {
    currentUser: User
    postsByUser(userId: String!): [Post]
  }

  type Mutation {
    addPost(content: String!, parent: ID): Post
  }

  type User {
    id: ID!
    username: String!
    posts: [Post]
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
    parent: ID
    replies: [ID]
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
        addPost: async (_, { content, parent }, { currentUserId, data }) => {
            let post = {
                id: 'xyz-' + (data.thread.length + 1),
                content: {
                    body: content,
                },
                userId: currentUserId,
            };
            return data.thread.reply(parent, post);
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
            if(obj.body){
                return 'Text';
            }
            if(obj.url){
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
