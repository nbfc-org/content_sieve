import { ObjectType, Field } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { BeforeInsert, BeforeUpdate } from "typeorm";

import marked from 'marked';

import { JSDOM, VirtualConsole } from "jsdom";
import createDOMPurify from "dompurify";

const data = "<html><body></body></html>";
const url = "http://example.com";

const virtualConsole = new VirtualConsole();
virtualConsole.sendTo(console, { omitJSDOMErrors: true });
const jsdom = new JSDOM(data, {
    url,
    virtualConsole
});

const DOMPurify = createDOMPurify(jsdom.window);

import { Post } from "./post.js";
import { Lazy } from "../helpers.js";
import { renderMarkdown } from '../../../lib/validation.js';

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
        this.rendered = renderMarkdown(this.body, DOMPurify.sanitize);
    }

    @OneToOne(() => Post, post => post.link)
    post: Lazy<Post>;
}
