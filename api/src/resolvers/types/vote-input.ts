import { MaxLength } from "class-validator";
import { InputType, Field, ID } from "type-graphql";

import { VoteType } from "../../entities/vote.js";

@InputType()
export class VoteInput {
    @Field(type => ID, { nullable: true })
    @MaxLength(32)
    postId?: string;

    @Field(type => ID, { nullable: true })
    @MaxLength(32)
    voteId?: string;

    @Field(type => VoteType)
    type: VoteType;
}
