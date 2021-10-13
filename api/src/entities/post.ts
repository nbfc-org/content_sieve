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
import { Vote } from "./vote.js";
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
        this.content = this.text || this.link;
        this.postId = uuid62.encode(this.postId);
        const { score, replies } = await getSlowPostData(this);
        this.score = score;
        this.replies = replies;
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
