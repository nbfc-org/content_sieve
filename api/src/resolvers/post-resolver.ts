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
        const manager = getManager();
        const id = uuid62.decode(postId);
        const post = await this.postRepository.findOne({ postId: id });
        return manager.getTreeRepository(Post).findDescendantsTree(post, { relations: ["link", "text", "votes", "author", "parent"] });
    }

    _dfs(nodes, pathmap, depth, parent=null) {
        let i = 0;
        for (const node of nodes) {
            const newdepth = [...depth, i];
            pathmap[node.id] = {
                index: newdepth,
                parent,
            };
            this._dfs(node.children, pathmap, newdepth, node);
            i = i + 1;
        }
    }

    @Query(returns => [Post])
    async postWithChildren(@Arg("postId", type => ID) postId: string): Promise<Post[]> {
        const manager = getManager();
        const id = uuid62.decode(postId);
        const post = await this.postRepository.findOne({ postId: id });

        if (!post) {
            throw new Error("Invalid post ID");
        }
        let posts = await manager.getTreeRepository(Post).findDescendants(post);
        // console.log(l);
        posts = await this.postRepository.find({ id: In(posts.map((p) => p.id)) });

        const node = await manager.getTreeRepository(Post).findDescendantsTree(post);
        // console.log(node);
        const pathmap = {};
        this._dfs([node], pathmap, []);
        // console.log(pathmap);
        // const posts = [post];
        for (const post of posts) {
            post.index = pathmap[post.id].index;
            post.parent = pathmap[post.id].parent;
        }
        return posts;
    }

    @Query(returns => [Post])
    async postsByUser(): Promise<Post[]> {
        const manager = getManager();
        const posts = await this.postRepository.find();
        return manager.getTreeRepository(Post).findTrees({ relations: ["link", "text", "votes", "author", "parent"] });
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
