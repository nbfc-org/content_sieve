import { ObjectType, ID, Field, registerEnumType } from "type-graphql";
import { Column, Entity, OneToMany, ManyToOne, Unique, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

import { User } from "./user.js";
import { Post } from "./post.js";
import { Lazy } from "../helpers.js";

import { AfterInsert, AfterLoad } from "typeorm";
import * as uuid62 from 'uuid62';

export enum VoteType {
    UP   = "up",
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
@Unique(["user", "post"])
@Unique(["user", "meta"])
export class Vote {
    @PrimaryGeneratedColumn()
    readonly id: number;

    @Field(type => ID)
    @Column({ type: 'uuid', unique: true, default: () => 'uuid_generate_v4()' })
    voteId: string;

    @Field(type => VoteType)
    @Column({
        type: "enum",
        enum: VoteType,
    })
    type: VoteType;

    @Field()
    @CreateDateColumn()
    date: Date;

    // @Field(type => User)
    @ManyToOne(type => User, { lazy: true })
    user: Lazy<User>;

    @Column()
    userId: number;

    @Column()
    metaId: number;

    @Column()
    postId: number;

    @Field({ nullable: true })
    username: string;

    // @Field(type => Post, { nullable: true })
    @ManyToOne(type => Post, { eager: true })
    post: Lazy<Post>;

    // @Field(type => Vote, { nullable: true })
    @ManyToOne(type => Vote, { lazy: true })
    meta: Lazy<Vote>;

    // @Field(type => [Vote], { nullable: true })
    @OneToMany(type => Vote, vote => vote.meta, { lazy: true })
    votes: Lazy<Vote[]>;

    @AfterLoad()
    @AfterInsert()
    async afterLoad() {
        if (this.voteId) {
            this.voteId = uuid62.encode(this.voteId);
        }
        if (this.user) {
            const user = await this.user;
            this.username = user.username;
        }
    }
}
