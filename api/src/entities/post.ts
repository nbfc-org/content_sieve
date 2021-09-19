import { ObjectType, ID, Field, Float, registerEnumType } from "type-graphql";
import { Entity, ViewEntity, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { Column, ViewColumn, JoinColumn, OneToOne, ManyToOne, OneToMany } from "typeorm";
import { ManyToMany, JoinTable, getManager } from "typeorm";
import { AfterInsert, AfterLoad } from "typeorm";
import { createUnionType } from "type-graphql";
import { Tree, TreeChildren, TreeParent } from "typeorm";

import * as uuid62 from 'uuid62';

import { User } from "./user.js";
import { Link } from "./link.js";
import { Text } from "./text.js";
import { Vote } from "./vote.js";
import { Tag } from "./tag.js";
import { Lazy } from "../helpers.js";

export enum SortType {
    NEWEST,
    OLDEST,
    MOST_REPLIES,
    HIGH_SCORE,
}

registerEnumType(SortType, {
    name: "SortType", // this one is mandatory
});

export const Content = createUnionType({
    name: "Content", // the name of the GraphQL union
    types: () => [Text, Link] as const, // function that returns tuple of object types classes
    resolveType: value => {
        if ("body" in value) {
            return Text; // we can return object type class (the one with `@ObjectType()`)
        }
        if ("url" in value) {
            return Link; // or the schema name of the type as a string
        }
        return undefined;
    },
});

@ViewEntity({
    // materialized: true,
    // type-graphql-lazy=# create unique index on top_level_scores (id);
    // type-graphql-lazy=# refresh materialized view CONCURRENTLY top_level_scores ;
    expression: `
select "postId" as "id", score, score/pow((extract(epoch from now()) - created_epoch)/3600+2,1.8) as hn_gravity, log(greatest(abs(score), 1)) + (case when score < 0 then -1 when score > 0 then 1 else 0 end) * (created_epoch - 1630000000) / 45000 as reddit_hot from (select vote."postId", sum(case when type='down' then -1 when type='up' then 1 else 0 end) as score, extract(epoch from max(post."createdAt")) as created_epoch from vote join post on vote."postId"=post.id and post."parentId" is null group by vote."postId") as foo
`
})
export class TopLevelScores {
    @ViewColumn()
    id: number;

    @ViewColumn()
    score: number;

    @ViewColumn()
    hn_gravity: number;

    @ViewColumn()
    reddit_hot: number;
}

@ViewEntity({
    // materialized: true,
    // type-graphql-lazy=# create unique index on comment_scores (id);
    // type-graphql-lazy=# refresh materialized view CONCURRENTLY comment_scores ;
    // wilson confidence interval: https://medium.com/hacking-and-gonzo/how-reddit-ranking-algorithms-work-ef111e33d0d9
    expression: `
select baz."postId" as "id", (l - r)/under as wilson from (select bar."postId", p + 1.0 / (2.0*n) * z * z as l, z*sqrt(p*(1.0-p)/n + z*z/(4*n*n)) as r, 1.0+1.0/n*z*z as under from (select foo."postId", ups + downs as n, 1.281551565545 as z, ups / (ups + downs) as p from (select vote."postId", sum(case when type='up' then 1 else 0 end) as ups, sum(case when type='down' then 1 else 0 end) as downs from vote join post on vote."postId"=post.id and post."parentId" is not null group by vote."postId") as foo) as bar) as baz
`
})
export class CommentScores {
    @ViewColumn()
    id: number;

    @ViewColumn()
    wilson: number;
}

@Entity()
@ObjectType()
@Tree("closure-table")
export class Post {
    @PrimaryGeneratedColumn()
    readonly id: number;

    @Field(type => ID)
    @Column('uuid')
    postId: string;

    @Field(type => Content)
    content: typeof Content;

    @Field(type => Float)
    score: number;

    @Column({ nullable: true })
    linkId: number;

    @Field(type => Float)
    @CreateDateColumn({type: 'timestamp with time zone'})
    createdAt: Date;

    @OneToOne(type => Link, { cascade: true, eager: true })
    @JoinColumn()
    link: Link;

    @Column({ nullable: true })
    textId: number;

    @OneToOne(type => Text, { cascade: true, eager: true })
    @JoinColumn()
    text: Text;

    @Field(type => [Vote], { nullable: true })
    @OneToMany(type => Vote, vote => vote.post, { eager: true, cascade: ["insert"] })
    votes: Lazy<Vote[]>;

    @Field(type => User)
    @ManyToOne(type => User, { eager: true })
    author: Lazy<User>;

    @Field(type => [Tag], { nullable: true })
    @ManyToMany(type => Tag, tag => tag.posts, { eager: true, cascade: ["insert"] })
    @JoinTable()
    tags: Tag[];

    @AfterLoad()
    @AfterInsert()
    async afterLoad() {
        this.content = this.text || this.link;
        this.postId = uuid62.encode(this.postId);
        this.score = 0;
        const manager = getManager();
        // TODO: move this to shared memory
        if (this.parent) {
            const tls = await manager.findOne(CommentScores, { id: this.id });
            if (tls) {
                this.score = tls.wilson;
            }
        } else {
            const tls = await manager.findOne(TopLevelScores, { id: this.id });
            if (tls) {
                this.score = tls.score;
            }
        }
    }

    @Field(type => [Post], { nullable: true })
    @TreeChildren()
    children: Lazy<Post[]>;

    @Field(type => Post, { nullable: true })
    @TreeParent()
    parent: Post;
}
