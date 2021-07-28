import { ObjectType, Field, registerEnumType } from "type-graphql";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

import { User } from "./user.js";
import { Post } from "./post.js";
import { Lazy } from "../helpers.js";

export enum VoteType {
    UP = "up",
    DOWN = "down",
    FLAG = "flag",
    SAVE = "save",
    HIDE = "hide",
}

registerEnumType(VoteType, {
    name: "VoteType", // this one is mandatory
});

@Entity()
@ObjectType()
export class Vote {
    @PrimaryGeneratedColumn()
    readonly id: number;

    @Field(type => VoteType)
    @Column({
        type: "enum",
        enum: VoteType,
    })
    type: VoteType;

    @Field()
    @CreateDateColumn()
    date: Date;

    @Field(type => User)
    @ManyToOne(type => User, { lazy: true })
    user: Lazy<User>;

    @ManyToOne(type => Post, { lazy: true })
    post: Lazy<Post>;
}
