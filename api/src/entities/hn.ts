import { ObjectType, Field } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { BeforeInsert, BeforeUpdate } from "typeorm";

import { PostType } from "./post_type.js";
import { Lazy, renderMD } from "../helpers.js";

@Entity()
@ObjectType()
export class HackerNews {
    @PrimaryGeneratedColumn()
    readonly id: number;

    @Column({ type: 'int', unique: true })
    xid: number;

    @Column({
        type: 'jsonb',
        default: () => "'[]'",
        nullable: false,
    })
    links: Array<string>;

    @Field()
    @Column()
    rendered: string;

    @BeforeInsert()
    @BeforeUpdate()
    async beforeInsert() {
        const links = this.links.map(l => `- [${l}](${l})`);
        const body = `
#### Hacker News [post ${this.xid}](https://news.ycombinator.com/item?id=${this.xid})

${links.join("\n")}
`;
        this.rendered = renderMD(body);
    }

    @OneToOne(() => PostType, post_type => post_type.mefi)
    post_type: Lazy<PostType>;
}
