import { Resolver, Query, Authorized, Arg, Mutation, Ctx, ID } from "type-graphql";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository, IsNull, Not } from "typeorm";

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
    @Query(returns => [Vote])
    async votes(@Ctx() { req }: Context): Promise<Vote[]> {
        return this.voteRepository.find({
            where: {
                post: Not(IsNull()),
            },
        });
    }

    @Authorized()
    @Mutation(returns => Vote)
    async vote(@Ctx() { req }: Context, @Arg("vote") voteInput: VoteInput): Promise<Vote> {

        const user = await findOrCreateUser(req.user);

        const is_meta = !!voteInput.voteId;
        let associations = {};
        let post;

        if (is_meta) {
            const vote = await this.voteRepository.findOneOrFail(
                { voteId: uuid62.decode(voteInput.voteId) },
            );
            associations = { meta: vote };
        } else {
            post = await this.postRepository.findOneOrFail(
                { postId: uuid62.decode(voteInput.postId) },
            );
            associations = { post };
        }

        const vote = this.voteRepository.create({
            ...associations,
            user,
            type: voteInput.type,
        });

        await this.voteRepository.save(vote);

        if (!is_meta) {
            invalidateCache(post);
        }

        return this.voteRepository.findOneOrFail(vote.id);
    }
}
