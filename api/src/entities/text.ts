import { ObjectType, Field } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { BeforeInsert, BeforeUpdate } from "typeorm";

import { Post } from "./post.js";
import { PostType } from "./post_type.js";
import { Lazy, renderMD } from "../helpers.js";

@Entity()
@ObjectType()
export class Text {
    @PrimaryGeneratedColumn()
    readonly id: number;

    @Field()
    @Column()
    body: string;

    @Field()
    @Column()
    rendered: string;

    @BeforeInsert()
    @BeforeUpdate()
    async beforeInsert() {
        this.rendered = renderMD(this.body);
    }

    @OneToOne(() => Post, post => post.text)
    post: Lazy<Post>;

    @OneToOne(() => PostType, post_type => post_type.text)
    post_type: Lazy<PostType>;
}
