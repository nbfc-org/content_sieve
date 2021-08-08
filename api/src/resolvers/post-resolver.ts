import { Resolver, Query, Arg, Mutation, Ctx, ID } from "type-graphql";
import { Repository, getManager, In } from "typeorm";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Vote } from "../entities/vote.js";
import { Post } from "../entities/post.js";
import { Text } from "../entities/text.js";
import { PostInput } from "./types/post-input.js";
import { VoteInput } from "./types/vote-input.js";
import { Context } from "./types/context.js";

import uuid62 from 'uuid62';

@Service()
@Resolver(Post)
export class PostResolver {
    constructor(
        @InjectRepository(Vote) private readonly voteRepository: Repository<Vote>,
        @InjectRepository(Post) private readonly postRepository: Repository<Post>,
        @InjectRepository(Text) private readonly textRepository: Repository<Text>,
    ) {}

    @Query(returns => Post, { nullable: true })
    async post(@Arg("postId", type => ID) postId: string) {
        const id = uuid62.decode(postId);
        const post = await this.postRepository.findOne({ postId: id });

        const repo = getManager().getTreeRepository(Post);
        const p = await repo.findDescendantsTree(post, { relations: ["link", "text", "votes", "author", "parent"] });

        // for non-root postId, the above doesn't get the top-level parent
        const parents = await repo.findAncestors(post);
        if (parents.length > 1) {
            p.parent = parents[parents.length-2];
        }
        return p;
    }

    @Query(returns => [Post])
    async postsByUser(): Promise<Post[]> {
        const manager = getManager();
        return manager.getTreeRepository(Post).findTrees({ relations: ["link", "text", "votes", "author", "parent"] });
        // defector: threaded only; newest, oldest, most replies, highest score
        // reddit: threaded only; best, top, new, controversial, old, q&a
        // metafilter: flat only; oldest first, no matter what
        // hn: threaded only; by score only
        //
        // quatratic weighting ... nth vote costs n^2
        //     weighting a vote by the "degree of separation" of the voter? (ie., friends count more)
        // hyperbolic discounting of karma acquisition
        // limiting the number of voters per item
        // new accounts can't vote until achived a network & karam status (eg., shares, by friends, are upvoted).
        // accounts which primarily upvote/downvote outside of their network are ignored
    }

    @Mutation(returns => Post)
    async addPost(@Arg("post") postInput: PostInput, @Ctx() { user }: Context): Promise<Post> {
        const texts = this.textRepository.create([
            { body: postInput.body },
        ]);
        const post = this.postRepository.create({
            postId: uuid62.decode(postInput.postId),
            text: texts[0],
            author: user,
        });
        await this.postRepository.save(post);
        post.parent = await this.postRepository.findOne({ postId: uuid62.decode(postInput.parentId) });
        const saved = await this.postRepository.save(post);
        saved.votes = [];
        return saved;
    }

    @Mutation(returns => Post)
    async vote(@Ctx() { user }: Context, @Arg("vote") voteInput: VoteInput): Promise<Post> {
        const post = await this.postRepository.findOne(
            { postId: uuid62.decode(voteInput.postId) },
            { relations: ["votes"] },
        );

        if (!post) {
            throw new Error("Invalid post ID");
        }

        (await post.votes).push(
            this.voteRepository.create({
                post,
                user,
                type: voteInput.type,
            }),
        );

        return await this.postRepository.save(post);
    }
}
