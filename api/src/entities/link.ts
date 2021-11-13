import { ObjectType, ID, Field } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, ManyToOne } from "typeorm";

import { Post } from "./post.js";
import { PostType } from "./post_type.js";
import { Lazy } from "../helpers.js";

@Entity()
@ObjectType()
export class Link {
    @PrimaryGeneratedColumn()
    readonly id: number;

    @Field()
    @Column()
    url: string;

    @Field()
    @Column()
    title: string;

    @OneToOne(() => PostType, post_type => post_type.link)
    post_type: Lazy<PostType>;
}
