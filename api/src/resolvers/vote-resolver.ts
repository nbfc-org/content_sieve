import { Resolver, Query, Authorized, Arg, Mutation, Ctx, Info } from "type-graphql";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository, IsNull, Not } from "typeorm";

import { Vote } from "../entities/vote.js";
import { VoteInput } from "./types/vote-input.js";
import { Post } from "../entities/post.js";
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

    @Authorized(['admin'])
    @Query(returns => [Vote])
    async votes(@Ctx() { req }: Context, @Info() info): Promise<Vote[]> {
        info.cacheControl.setCacheHint({ maxAge: 0, scope: 'PRIVATE' });
        return this.voteRepository.find({
            where: {
                // post: Not(IsNull()),
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

        const ev = { userId: user.id };
        if (is_meta) {
            const vote = await this.voteRepository.findOneOrFail(
                { voteId: uuid62.decode(voteInput.voteId) },
            );
            const vote_user = await vote.user;
            if (user.id === vote_user.id) {
                throw new Error("Can't self vote");
            }
            associations = { meta: vote };
            ev['metaId'] = vote.id;
        } else {
            post = await this.postRepository.findOneOrFail(
                { postId: uuid62.decode(voteInput.postId) },
            );
            const post_user = await post.author;
            if (user.id === post_user.id) {
                throw new Error("Can't self vote");
            }
            associations = { post };
            ev['postId'] = post.id;
        }

        const vote = this.voteRepository.create({
            ...associations,
            user,
            type: voteInput.type,
        });

        const existingVote = await this.voteRepository.findOne(ev);

        if (existingVote) {
            if (existingVote.type == vote.type) {
                return existingVote;
            } else {
                await this.voteRepository.remove(existingVote);
            }
        }

        await this.voteRepository.save(vote);

        if (!is_meta) {
            invalidateCache(post);
        }

        return this.voteRepository.findOneOrFail(vote.id);
    }
}
