const { ApolloServer, gql } = require('apollo-server');

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

var data = {};

data.posts = [
    {
        id: 'xyz-1',
        content: {
            body: "First Post - Hello world",
        },
        userId: 'abc-1',
    },
    {
        id: 'xyz-2',
        content: {
            body: "Second Post - Hello again",
        },
        userId: 'abc-1',
        parent: 'xyz-1',
    },
    {
        id: 'xyz-3',
        content: {
            title: "Random Post",
            url: "https://google.com",
        },
        userId: 'abc-1',
        parent: 'xyz-1',
    }
];

data.users = [
    {
        id: 'abc-1',
        username: "andy25",
    },
    {
        id: 'abc-2',
        username: "randomUser",
    }
];

const currentUserId = 'abc-1';

var resolvers = {
    Query: {
        currentUser: (_, __, { data, currentUserId }) => {
            let user = data.users.find( u => u.id === currentUserId );
            return user;
        },
        postsByUser: (_, { userId }, { data }) => {
            let posts = data.posts.filter( p => p.userId === userId );
            return posts;
        },
    },
    Mutation: {
        addPost: async (_, { content, parent }, { currentUserId, data }) => {
            let post = {
                id: 'xyz-' + (data.posts.length + 1),
                content: {
                    body: content,
                },
                userId: currentUserId,
                parent,
            };
            data.posts.push(post);
            return post;
        }
    },
    User: {
        posts: (parent, __, { data }) => {
            let posts = data.posts.filter( p => p.userId === parent.id );
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
