import { InputType, Field, Int, ID } from "type-graphql";

import { VoteType } from "../../entities/vote.js";

@InputType()
export class VoteInput {
    @Field(type => ID)
    postId: string;

    @Field(type => VoteType)
    type: VoteType;
}
