import { ObjectType, ID, Field } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, ManyToOne } from "typeorm";
import { AfterLoad, getRepository } from "typeorm";
import { createUnionType } from "type-graphql";

import { User } from "./user.js";
import { Post } from "./post.js";
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

    @OneToOne(() => Post, post => post.link)
    post: Lazy<Post>;
}