import { ObjectType, ID, Field, Float, Int } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { Column, JoinColumn, OneToOne, ManyToOne, OneToMany } from "typeorm";
import { AfterInsert, AfterLoad } from "typeorm";
import { createUnionType } from "type-graphql";
import { Tree, TreeChildren, TreeParent } from "typeorm";

import uuid62 from 'uuid62';

import { User } from "./user.js";
import { Link } from "./link.js";
import { Text } from "./text.js";
import { Vote } from "./vote.js";
import { Lazy } from "../helpers.js";

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

    @Column({ nullable: true })
    linkId: number;

    @Field(type => Float)
    @CreateDateColumn({type: 'timestamp with time zone'})
    createdAt: Date;

    @Field(type => [Int])
    index: number[];

    @OneToOne(type => Link, { cascade: true, eager: true })
    @JoinColumn()
    link: Link;

    @Column({ nullable: true })
    textId: number;

    @OneToOne(type => Text, { cascade: true, eager: true })
    @JoinColumn()
    text: Text;

    @Field(type => [Vote])
    @OneToMany(type => Vote, vote => vote.post, { lazy: true, cascade: ["insert"] })
    votes: Lazy<Vote[]>;

    @Field(type => User)
    @ManyToOne(type => User, { eager: true })
    author: Lazy<User>;

    @AfterLoad()
    @AfterInsert()
    async afterLoad() {
        this.content = this.text || this.link;
        this.postId = uuid62.encode(this.postId);
    }

    @TreeChildren()
    children: Post[];

    @Field(type => Post, { nullable: true })
    @TreeParent()
    parent: Post;
}
