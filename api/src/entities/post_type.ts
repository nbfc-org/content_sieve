import { ObjectType } from "type-graphql";
import { Entity, JoinColumn, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";

import { Post } from "./post.js";
import { Link } from "./link.js";
import { Text } from "./text.js";
import { Mefi } from "./mefi.js";
import { Lazy } from "../helpers.js";

export enum PostTypeEnum {
    TEXT = "text",
    LINK = "link",
    MEFI = "metafilter",
    HN   = "hackernews",
}

@Entity()
@ObjectType()
export class PostType {
    @PrimaryGeneratedColumn()
    readonly id: number;

    @Column({
        type: "enum",
        enum: PostTypeEnum,
    })
    postType: PostTypeEnum;

    @OneToOne(() => Post, post => post.type)
    post: Lazy<Post>;

    @Column()
    contentId: number;

    @OneToOne(() => Link, { cascade: true, eager: true })
    @JoinColumn({ name: 'contentId' })
    link: Lazy<Link>;

    @OneToOne(() => Text, { cascade: true, eager: true })
    @JoinColumn({ name: 'contentId' })
    text: Lazy<Text>;

    @OneToOne(() => Mefi, { cascade: true, eager: true })
    @JoinColumn({ name: 'contentId' })
    mefi: Lazy<Mefi>;
}
