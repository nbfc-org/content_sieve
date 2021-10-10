import { Resolver, Query, Authorized, Arg, Mutation, Ctx, ID } from "type-graphql";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";

import { Vote } from "../entities/vote.js";
import { VoteInput } from "./types/vote-input.js";
import { Post, SortType } from "../entities/post.js";
import { findOrCreateUser } from "../entities/user.js";
import { Context } from "./types/context.js";
import { invalidateCache } from "../helpers.js";

import * as uuid62 from 'uuid62';

@Service()
@Resolver(Vote)
export class VoteResolver {
    constructor(
        @InjectRepository(Post) private readonly postRepository: Repository<Post>,
        @InjectRepository(Vote) private readonly voteRepository: Repository<Vote>,
    ) {}

    /*
    @Authorized()
    @Query(returns => User)
    async getOwnUser(@Ctx() { req }: Context): Promise<User> {
        const user = await findOrCreateUser(req.user);
        // console.log(user.settings);
        return user;
    }
    */

    @Authorized()
    @Mutation(returns => Post)
    async vote(@Ctx() { req }: Context, @Arg("vote") voteInput: VoteInput): Promise<Post> {

        const user = await findOrCreateUser(req.user);

        const post = await this.postRepository.findOne(
            { postId: uuid62.decode(voteInput.postId) },
        );

        if (!post) {
            throw new Error("Invalid post ID");
        }

        const vote = this.voteRepository.create({
            post,
            user,
            type: voteInput.type,
        });

        await this.voteRepository.save(vote);

        invalidateCache(post);

        return post;
    }
}
