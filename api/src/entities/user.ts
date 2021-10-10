import { Field, InputType, ObjectType } from "type-graphql";
import { getManager, PrimaryColumn, PrimaryGeneratedColumn, Column, Entity, OneToMany, ManyToOne } from "typeorm";

import { Post, SortType } from "./post.js";
import { Lazy } from "../helpers.js";

const example_jwt = {
    exp: 1632631658,
    iat: 1632631358,
    auth_time: 1632631357,
    jti: '86638025-4bc7-4cba-8ac2-9a6fd1f2dbee',
    iss: 'http://localhost:28080/auth/realms/content-sieve-dev',
    aud: 'account',
    sub: '156d6254-406c-4a84-8e21-f2abc7948420',
    typ: 'Bearer',
    azp: 'content-sieve-local-vue',
    nonce: '3c639120-50e7-4c55-9bee-6857e615a342',
    session_state: '8e0339a1-dc30-458a-9aa3-190acb35c6a5',
    acr: '1',
    'allowed-origins': [ 'http://localhost:8080', 'http://localhost:4000' ],
    realm_access: {
        roles: [
            'default-roles-content sieve dev',
            'offline_access',
            'uma_authorization'
        ]
    },
    resource_access: {
        'content-sieve-local-vue': { roles: [Array] },
        account: { roles: [Array] },
    },
    scope: 'openid email profile',
    sid: '8e0339a1-dc30-458a-9aa3-190acb35c6a5',
    email_verified: false,
    preferred_username: 'iej1zood',
};

export const findOrCreateUser = async (jwt) => {
    const manager = getManager();
    const repo = manager.getRepository(User);
    const jrepo = manager.getRepository(Jwt);

    let user = await repo.findOne({
        username: jwt.preferred_username,
    });

    if (!user) {
        user = repo.create({
            username: jwt.preferred_username,
        });
        await repo.save(user);

        const j = jrepo.create({
            sub: jwt.sub,
            iss: jwt.iss,
            azp: jwt.azp,
            username: user.username,
            user,
        });
        await jrepo.save(j);
    }
    return user;
};

@ObjectType()
@Entity()
export class Jwt {
    @PrimaryColumn('uuid')
    sub: string;

    @Column()
    iss: string;

    @Column()
    azp: string;

    @Column()
    username: string;

    @Field(type => User)
    @ManyToOne(type => User, { lazy: true })
    user: Lazy<User>;
}

@ObjectType({ isAbstract: true })
@InputType({ isAbstract: true })
export class UserSettings {
    @Field({ nullable: true })
    sortType?: SortType;

    @Field({ nullable: true })
    nested?: Boolean;
}

@ObjectType()
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    readonly id: number;

    @Field()
    @Column({ unique: true})
    username: string;

    @Field(type => UserSettings)
    @Column({ type: "jsonb", default: {} })
    settings: UserSettings;

    @OneToMany(type => Post, post => post.author, { lazy: true })
    @Field(type => [Post])
    posts: Lazy<Post[]>;

    @OneToMany(type => Jwt, jwt => jwt.user, { lazy: true })
    jwts: Lazy<Post[]>;
}
