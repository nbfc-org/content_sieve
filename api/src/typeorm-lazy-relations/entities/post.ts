import { ObjectType, ID, Field } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, ManyToOne } from "typeorm";
import { AfterLoad, getRepository } from "typeorm";
import { createUnionType } from "type-graphql";

import { User } from "./user.js";
import { Link } from "./link.js";
import { Text } from "./text.js";
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
export class Post {
    @Field(type => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field(type => Content)
    content: typeof Content;

    @Column({ nullable: true })
    linkId: number;

    @OneToOne(type => Link, { cascade: true, eager: true })
    @JoinColumn()
    link: Link;

    @Column({ nullable: true })
    textId: number;

    @OneToOne(type => Text, { cascade: true, eager: true })
    @JoinColumn()
    text: Text;

    @Field(type => User, { nullable: true })
    @ManyToOne(type => User, { lazy: true })
    author: Lazy<User>;

    @AfterLoad()
    async afterLoad() {
        this.content = this.text || this.link;
    }
}
