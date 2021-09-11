import "reflect-metadata";

import express from 'express';
import { ApolloServer } from "apollo-server-express";

import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import cors from 'cors';

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

        app.use(cors());

        //jwtCheck
        const checkJwt = jwt({
            // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint
            secret: jwksRsa.expressJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: 'https://***REMOVED***.auth0.com/.well-known/jwks.json',
            }),

            // Validate the audience and the issuer
            audience: 'http://localhost:4001/graphql',
            issuer: 'https://***REMOVED***.auth0.com/',
            algorithms: [ 'RS256' ],
            credentialsRequired: false,
        });

        app.use(checkJwt);

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
