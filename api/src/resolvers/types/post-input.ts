import { MaxLength } from "class-validator";
import { ID, InputType, Field } from "type-graphql";

import { Post } from "../../entities/post.js";

@InputType()
export class PostInput implements Partial<Post> {
    @Field(type => ID)
    @MaxLength(32)
    postId: string;

    @Field({ nullable: true })
    @MaxLength(65536)
    body?: string;

    @Field({ nullable: true })
    @MaxLength(128)
    title?: string;

    @Field({ nullable: true })
    @MaxLength(2048)
    url?: string;

    @Field({ nullable: true })
    @MaxLength(32)
    parentId?: string;

    @Field(type => String, { nullable: true })
    @MaxLength(128)
    tagString?: string;
}
