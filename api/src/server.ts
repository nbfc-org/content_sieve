import "reflect-metadata";

import express from 'express';
import { ApolloServer } from "apollo-server-express";
import * as jwt from 'express-jwt';

import { Container } from "typedi";
import * as TypeORM from "typeorm";
import * as TypeGraphQL from "type-graphql";

import { PostResolver } from "./resolvers/post-resolver.js";
import { User } from "./entities/user.js";
import { Link } from "./entities/link.js";
import { Text } from "./entities/text.js";
import { Post } from "./entities/post.js";
import { Vote } from "./entities/vote.js";
import { Tag, TagText } from "./entities/tag.js";
import { seedDatabase } from "./helpers.js";
import { Context } from "./resolvers/types/context.js";

import { config } from "../../lib/config.js";

// register 3rd party IOC container
TypeORM.useContainer(Container);

export async function bootstrap() {
    try {
        // create TypeORM connection
        await TypeORM.createConnection({
            type: "postgres",
            username: "postgres", // fill this with your username
            ...config.db,
            entities: [User, Text, Link, Post, Vote, Tag, TagText],
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

        const app = express();

        // Create GraphQL server
        const server = new ApolloServer({
            schema,
            context: ({ req }) => {
                return {
                    req,
                    // TODO: unhardcode this when auth exists
                    user: defaultUser,
                };
            },
        });

        await server.start();

        server.applyMiddleware({ app });

        await app.listen({ port: config.api.port });

    } catch (err) {
        console.error(err);
    }
}

bootstrap();
