import { ObjectType, Field } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { BeforeInsert, BeforeUpdate } from "typeorm";

import { PostType } from "./post_type.js";
import { Lazy, renderMD } from "../helpers.js";

@Entity()
@ObjectType()
export class Mefi {
    @PrimaryGeneratedColumn()
    readonly id: number;

    @Column({ type: 'int', unique: true })
    xid: number;

    @Column()
    url: string;

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
#### MetaFilter [post ${this.xid}](https://www.metafilter.com${this.url})

${links.join("\n")}
`;
        this.rendered = renderMD(body);
    }

    @OneToOne(() => PostType, post_type => post_type.mefi)
    post_type: Lazy<PostType>;
}
