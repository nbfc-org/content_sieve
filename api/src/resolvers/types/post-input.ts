import { ID, InputType, Field, Int } from "type-graphql";

import { Post } from "../../entities/post.js";

@InputType()
export class PostInput implements Partial<Post> {
    @Field(type => ID)
    postId: string;

    @Field(type => ID)
    parentId: string;

    @Field(type => String)
    body: string;

    @Field(type => [Int])
    index: number[];
}
