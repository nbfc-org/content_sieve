import { ObjectType, ID, Field, Float, Int, registerEnumType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { Column, JoinColumn, OneToOne, ManyToOne, OneToMany } from "typeorm";
import { ManyToMany, JoinTable } from "typeorm";
import { AfterInsert, AfterLoad } from "typeorm";
import { createUnionType } from "type-graphql";
import { Tree, TreeChildren, TreeParent } from "typeorm";

import * as uuid62 from 'uuid62';

import { User } from "./user.js";
import { Link } from "./link.js";
import { Text } from "./text.js";
import { Mefi } from "./mefi.js";
import { HackerNews } from "./hn.js";
import { Vote } from "./vote.js";
import { PostType, PostTypeEnum } from "./post_type.js";
import { Tag } from "./tag.js";
import { Lazy, getSlowPostData } from "../helpers.js";

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
    types: () => [Text, Link, Mefi, HackerNews] as const, // function that returns tuple of object types classes
    resolveType: value => {
        if ("body" in value) {
            return Text; // we can return object type class (the one with `@ObjectType()`)
        }
        if ("xid" in value) {
            return Text; // or the schema name of the type as a string
        }
        if ("url" in value) {
            return Link; // or the schema name of the type as a string
        }
        return undefined;
    },
});

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

    @Field(type => Int)
    replies: number;

    @Field(type => Int)
    depth: number;

    @Field(type => Float)
    @CreateDateColumn({type: 'timestamp with time zone'})
    createdAt: Date;

    @OneToOne(type => PostType, { cascade: true, eager: true })
    @JoinColumn()
    type: PostType;

    @Field(type => [Vote], { nullable: true })
    @OneToMany(type => Vote, vote => vote.post, { lazy: true, cascade: ["insert"] })
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
        this.postId = uuid62.encode(this.postId);

        if (this.type && this.type.postType) {
            switch (this.type.postType) {
                case PostTypeEnum.TEXT:
                    this.content = await this.type.text;
                    break;
                case PostTypeEnum.MEFI:
                    this.content = await this.type.mefi;
                    break;
                case PostTypeEnum.HN:
                    this.content = await this.type.hn;
                    break;
                case PostTypeEnum.LINK:
                    this.content = await this.type.link;
                    break;
            }
        } else {
            // this only happens on invalidateCache
            // console.error(`still using text/link ids for ${this.postId}`);
        }

        const { score, replies, depth } = await getSlowPostData(this);
        this.score = score;
        this.replies = replies;
        this.depth = depth;
   }

    @Field(type => [Post], { nullable: true })
    @TreeChildren()
    children: Lazy<Post[]>;

    @Column({ type: "int", nullable: true })
    parentId: string;

    @Field(type => Post, { nullable: true })
    @JoinColumn({ name: "parentId" })
    @TreeParent()
    parent: Post;
}
