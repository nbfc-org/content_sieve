import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import { Container } from "typedi";
import * as TypeORM from "typeorm";
import * as TypeGraphQL from "type-graphql";

import { PostResolver } from "./resolvers/post-resolver.js";
import { User } from "./entities/user.js";
import { Link } from "./entities/link.js";
import { Text } from "./entities/text.js";
import { Post } from "./entities/post.js";
import { Vote } from "./entities/vote.js";
import { seedDatabase } from "./helpers.js";
import { Context } from "./resolvers/types/context.js";

// register 3rd party IOC container
TypeORM.useContainer(Container);

export async function bootstrap() {
    try {
        // create TypeORM connection
        await TypeORM.createConnection({
            type: "postgres",
            database: "type-graphql-lazy",
            username: "postgres", // fill this with your username
            password: "wat", // and password
            port: 5432, // and port
            host: "localhost", // and host
            entities: [User, Text, Link, Post, Vote],
            synchronize: true,
            logger: "advanced-console",
            logging: "all",
            dropSchema: true,
            cache: true,
        });

        // seed database with some data
        const { defaultUser } = await seedDatabase();

        // build TypeGraphQL executable schema
        const schema = await TypeGraphQL.buildSchema({
            resolvers: [PostResolver],
            container: Container,
        });

        // TODO: unhardcode this when auth exists
        const context: Context = { user: defaultUser };

        // Create GraphQL server
        const server = new ApolloServer({ schema, context });

        // Start the server
        const { url } = await server.listen(4001);
        console.log(`Server is running, GraphQL Playground available at ${url}`);
    } catch (err) {
        console.error(err);
    }
}

bootstrap();
