import { MaxLength } from "class-validator";
import { InputType, Field, ID } from "type-graphql";

import { VoteType } from "../../entities/vote.js";

@InputType()
export class VoteInput {
    @Field(type => ID)
    @MaxLength(32)
    postId: string;

    @Field(type => VoteType)
    type: VoteType;
}
