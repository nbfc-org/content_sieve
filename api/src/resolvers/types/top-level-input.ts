import { MaxLength } from "class-validator";
import { InputType, Field } from "type-graphql";

import { SortType } from "../../entities/post.js";

@InputType()
export class TopLevelInput {
    @Field({ defaultValue: "all" })
    @MaxLength(255)
    tag: string;

    @Field(type => SortType, { defaultValue: SortType.NEWEST })
    sortBy: number;

    @Field(type => Number, { defaultValue: 0 })
    page: number;
}
