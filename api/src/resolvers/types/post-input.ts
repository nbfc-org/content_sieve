import { ID, InputType, Field } from "type-graphql";

import { Post } from "../../entities/post.js";

@InputType()
export class PostInput implements Partial<Post> {
    @Field(type => ID)
    postId: string;

    @Field({ nullable: true })
    body?: string;

    @Field({ nullable: true })
    title?: string;

    @Field({ nullable: true })
    url?: string;

    @Field({ nullable: true })
    parentId?: string;

    @Field(type => [String], { nullable: true })
    tags?: [string];
}
