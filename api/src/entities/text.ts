import { ObjectType, Field } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { BeforeInsert, BeforeUpdate } from "typeorm";

import { Post } from "./post.js";
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

    @OneToOne(() => Post, post => post.link)
    post: Lazy<Post>;
}
