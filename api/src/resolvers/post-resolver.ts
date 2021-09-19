import { Resolver, Query, Arg, Mutation, Ctx, ID } from "type-graphql";
import { Repository, getManager } from "typeorm";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { AuthenticationError } from "apollo-server-express";

import { Vote } from "../entities/vote.js";
import { Post, SortType } from "../entities/post.js";
import { Text } from "../entities/text.js";
import { Link } from "../entities/link.js";
import { Tag, TagText } from "../entities/tag.js";
import { PostInput } from "./types/post-input.js";
import { VoteInput } from "./types/vote-input.js";
import { TopLevelInput } from "./types/top-level-input.js";
import { Context } from "./types/context.js";

import { splitTags } from '../../../lib/validation.js';

import * as uuid62 from 'uuid62';

@Service()
@Resolver(Post)
export class PostResolver {
    constructor(
        @InjectRepository(Vote) private readonly voteRepository: Repository<Vote>,
        @InjectRepository(Post) private readonly postRepository: Repository<Post>,
        @InjectRepository(Text) private readonly textRepository: Repository<Text>,
        @InjectRepository(Link) private readonly linkRepository: Repository<Link>,
        @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
        @InjectRepository(TagText) private readonly tagTextRepository: Repository<TagText>,
    ) {}

    @Query(returns => Post, { nullable: true })
    async post(@Arg("postId", type => ID) postId: string) {
        const id = uuid62.decode(postId);
        const post = await this.postRepository.findOne({ postId: id });

        const repo = getManager().getTreeRepository(Post);
        const p = await repo.findDescendantsTree(post, { relations: ["link", "text", "tags", "author", "parent"] });

        // for non-root postId, the above doesn't get the top-level parent
        const parents = await repo.findAncestors(post);
        if (parents.length > 1) {
            p.parent = parents[parents.length-2];
        }
        return p;
    }

    @Query(returns => [Post])
    async postsWithTag(@Arg("tli", type => TopLevelInput) tli: TopLevelInput): Promise<Post[]> {
        const take = 5;
        const skip = tli.page * take

        let query = this.postRepository
            .createQueryBuilder("post")
            .where("post.parent is NULL")
            .leftJoinAndSelect("post.author", "author")
            .leftJoinAndSelect("post.link", "link")
            .leftJoinAndSelect("post.tags", "tags")
            .leftJoinAndSelect("tags.canonical", "canonical", "tags.canonical = canonical.id")
            .leftJoinAndSelect("post.text", "text")
            .leftJoinAndSelect("post.parent", "parent");

        if (tli.tag !== "all") {
            query = query.leftJoin("post.tags", "sometags")
                .leftJoin("tag_text", "sometag_text", "sometags.canonical = sometag_text.id")
                .andWhere("sometag_text.slug = :slug", { slug: tli.tag });
        }

        const getOrderBy = (orderBy): [string, any] => {
            switch (orderBy) {
                case SortType.NEWEST:
                    return ["post.createdAt", "DESC"];
                case SortType.OLDEST:
                    return ["post.createdAt", "ASC"];
                case SortType.MOST_REPLIES:
                    return ["post.createdAt", "DESC"];
                case SortType.HIGH_SCORE:
                    return ["post.createdAt", "DESC"];
            }
        };

        query = query.orderBy(...getOrderBy(tli.sortBy));
        return query.getMany();
    }

    @Query(returns => [Post])
    async postsByUser(): Promise<Post[]> {
        const manager = getManager();
        return manager.getTreeRepository(Post).findTrees({ relations: ["link", "text", "tags", "author", "parent"] });

        // comments, wilson confidence interval
        // select baz."postId", (l - r)/under as wilson from (select bar."postId", p + 1.0 / (2.0*n) * z * z as l, z*sqrt(p*(1.0-p)/n + z*z/(4*n*n)) as r, 1.0+1.0/n*z*z as under from (select foo."postId", ups + downs as n, 1.281551565545 as z, ups / (ups + downs) as p from (select vote."postId", sum(case when type='up' then 1 else 0 end) as ups, sum(case when type='down' then 1 else 0 end) as downs from vote join post on vote."postId"=post.id and post."parentId" is not null group by vote."postId") as foo) as bar) as baz;

        // defector: threaded only; newest, oldest, most replies, highest score
        // reddit: threaded only; best, top, new, controversial, old, q&a
        // metafilter: flat only; oldest first, no matter what
        // hn: threaded only; by score only
        //
        // quatratic weighting ... nth vote costs n^2
        //     weighting a vote by the "degree of separation" of the voter? (ie., friends count more)
        // hyperbolic discounting of karma acquisition
        // limiting the number of voters per item
        // new accounts can't vote until achived a network & karma status (eg., shares, by friends, are upvoted).
        // accounts which primarily upvote/downvote outside of their network are ignored
    }

    @Mutation(returns => Post)
    async addPost(@Arg("post") postInput: PostInput, @Ctx() { user, req }: Context): Promise<Post> {

        if (!req.user) {
            throw new AuthenticationError('You are not logged-in.');
        }
        const post_attrs = {
            postId: uuid62.decode(postInput.postId),
            author: user,
        };

        let post;
        if (postInput.url) {
            // link
            const [ link ] = this.linkRepository.create([
                { url: postInput.url, title: postInput.title },
            ]);

            post = this.postRepository.create({...post_attrs, link});
            await this.postRepository.save(post);

        } else if (postInput.body) {
            // text
            const [ text ] = this.textRepository.create([
                { body: postInput.body },
            ]);

            post = this.postRepository.create({...post_attrs, text});
            await this.postRepository.save(post);

            if (postInput.parentId) {
                // reply
                post.parent = await this.postRepository.findOne({ postId: uuid62.decode(postInput.parentId) });
                await this.postRepository.save(post);
            }
        }

        if (postInput.tagString) {
            const tags = [];
            for (const slug of splitTags(postInput.tagString)) {
                let tag;
                let tt;
                tt = await this.tagTextRepository.findOne({slug});
                if (tt) {
                    tag = await this.tagRepository.findOne(
                        { canonical: tt },
                        { relations: ["canonical"] },
                    );
                } else {
                    tt = this.tagTextRepository.create({ slug });
                    await this.tagTextRepository.save(tt);
                    tag = this.tagRepository.create({ slugs: [tt], canonical: tt });
                    await this.tagRepository.save(tag);
                }
                tags.push(tag);
            }

            post.tags = tags;
            await this.postRepository.save(post);
        }

        return post;
    }

    @Mutation(returns => Post)
    async vote(@Ctx() { user, req }: Context, @Arg("vote") voteInput: VoteInput): Promise<Post> {
        if (!req.user) {
            throw new AuthenticationError('You are not logged-in.');
        }
        console.log(req.user);

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
        return post;
    }
}
