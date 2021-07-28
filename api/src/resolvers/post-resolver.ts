import { Resolver, Query, Arg, Mutation, Ctx, Int } from "type-graphql";
import { Repository } from "typeorm";
import { getManager } from "typeorm";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Vote } from "../entities/vote.js";
import { Post } from "../entities/post.js";
import { Text } from "../entities/text.js";
import { PostInput } from "./types/post-input.js";
import { VoteInput } from "./types/vote-input.js";
import { Context } from "./types/context.js";

import base36 from 'base36';
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
    post(@Arg("postId", type => String) postId: string) {
        return this.postRepository.findOne(postId);
    }

    _dfs(nodes, pathmap, depth, parent=null) {
        let i = 0;
        for (const node of nodes) {
            const newdepth = [...depth, i];
            pathmap[node.id] = {
                index: newdepth.map(j => base36.base36encode(j).padStart(2, "0")).join(':'),
                parent,
            };
            this._dfs(node.children, pathmap, newdepth, node);
            i = i + 1;
        }
    }

    @Query(returns => [Post])
    async postsByUser(): Promise<Post[]> {
        const manager = getManager();
        const posts = await this.postRepository.find();
        const nodes = await manager.getTreeRepository(Post).findTrees();
        const pathmap = {};
        this._dfs(nodes, pathmap, []);
        for (const post of posts) {
            post.index = pathmap[post.id].index;
            post.parent = pathmap[post.id].parent;
        }
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
        return posts;
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
        saved.index = `${postInput.index}:00`;
        return saved;
    }

    @Mutation(returns => Post)
    async vote(@Ctx() { user }: Context, @Arg("vote") voteInput: VoteInput): Promise<Post> {
        const post = await this.postRepository.findOne(voteInput.postId, {
            relations: ["votes"], // preload the relation as we will modify it
        });
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
