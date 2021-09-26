import "reflect-metadata";

import * as express from 'express';
import { ApolloServer } from "apollo-server-express";

import * as jwt from 'express-jwt';
import * as jwksRsa from 'jwks-rsa';
import * as cors from 'cors';

import { Container } from "typedi";
import { createConnection, getRepository, useContainer } from "typeorm";
import * as TypeGraphQL from "type-graphql";

import { PostResolver } from "./resolvers/post-resolver.js";
import { User, Jwt } from "./entities/user.js";
import { Link } from "./entities/link.js";
import { Text } from "./entities/text.js";
import { Post } from "./entities/post.js";
import { TopLevelScores, CommentScores } from "./entities/views.js";
import { Vote } from "./entities/vote.js";
import { Tag, TagText } from "./entities/tag.js";
import { seedDatabase } from "./helpers.js";

import { config } from "../../lib/config.js";

// register 3rd party IOC container
useContainer(Container);

export async function bootstrap(generate_db) {
    let pgOpts = {};
    if (generate_db) {
        pgOpts = {
            synchronize: true,
            dropSchema: true,
        };
    }

    try {
        // create TypeORM connection
        await createConnection({
            type: "postgres",
            username: "postgres", // fill this with your username
            ...config.db,
            entities: [User, Jwt, Text, Link, Post, Vote,
                       TopLevelScores, CommentScores,
                       Tag, TagText],
            logger: "advanced-console",
            logging: "all",
            ...pgOpts,
            // cache: true,
        });
        // seed database with some data
        let defaultUser;
        if (generate_db) {
            ({ defaultUser } = await seedDatabase());
        } else {
            const userRepository = getRepository(User);
            defaultUser = await userRepository.findOne();
        }

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
                jwksUri: config.keycloak.jwksUri,
            }),

            // Validate the audience and the issuer
            audience: 'account',
            issuer: config.keycloak.issuer,
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

bootstrap(false);
