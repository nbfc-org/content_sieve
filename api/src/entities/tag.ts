import { ObjectType, Field } from "type-graphql";
import { Column, Entity, ManyToOne, ManyToMany, OneToOne, JoinColumn, OneToMany, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

import { Lazy } from "../helpers.js";
import { Post } from "./post.js";

@Entity()
@ObjectType()
export class Tag {
    @PrimaryGeneratedColumn()
    readonly id: number;

    @Field(type => TagText)
    @OneToOne(type => TagText, { eager: true })
    @JoinColumn()
    canonical: Lazy<TagText>;

    @OneToMany(type => TagText, t => t.tag, { lazy: true })
    @Field(type => [TagText])
    slugs: Lazy<TagText[]>;

    @ManyToMany(() => Post, post => post.tags)
    posts: Lazy<Post[]>;
}

@Entity()
@ObjectType()
export class TagText {
    @PrimaryGeneratedColumn()
    readonly id: number;

    @Field()
    @Column()
    slug: string;

    @CreateDateColumn({type: 'timestamp with time zone'})
    createdAt: Date;

    @ManyToOne(type => Tag, { lazy: true })
    tag: Lazy<Tag>;
}
