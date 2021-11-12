import { Resolver, Query, Authorized, Arg, Mutation, Ctx, ID } from "type-graphql";
import { Repository, getManager } from "typeorm";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Post, SortType } from "../entities/post.js";
import { PostType } from "../entities/post_type.js";
import { Text } from "../entities/text.js";
import { Link } from "../entities/link.js";
import { findOrCreateUser } from "../entities/user.js";
import { Tag, TagText } from "../entities/tag.js";
import { PostInput } from "./types/post-input.js";
import { TopLevelInput } from "./types/top-level-input.js";
import { Context } from "./types/context.js";

import { invalidateCache, addPostPure } from "../helpers.js";

import * as uuid62 from 'uuid62';

@Service()
@Resolver(Post)
export class PostResolver {
    constructor(
        @InjectRepository(Post) private readonly postRepository: Repository<Post>,
        @InjectRepository(Text) private readonly textRepository: Repository<Text>,
        @InjectRepository(Link) private readonly linkRepository: Repository<Link>,
        @InjectRepository(PostType) private readonly postTypeRepository: Repository<PostType>,
        @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
        @InjectRepository(TagText) private readonly tagTextRepository: Repository<TagText>,
    ) {}

    @Query(returns => Post, { nullable: true })
    async post(@Arg("postId", type => ID) postId: string) {
        const id = uuid62.decode(postId);
        const post = await this.postRepository.findOne({ postId: id });

        const repo = getManager().getTreeRepository(Post);

        const p = await repo.findDescendantsTree(post, { relations: ["type", "tags", "author", "parent"] });

        const parents = await repo.findAncestors(post, { relations: ["type", "link", "text", "tags", "author", "parent"] });
        if (parents.length > 1) {
            p.parent = parents[parents.length-2];
        }
        return p;
    }

    @Query(returns => [Post])
    async postsWithTag(@Arg("tli", type => TopLevelInput) tli: TopLevelInput): Promise<Post[]> {
        const take = 20;
        const skip = tli.page * take

        let query = this.postRepository
            .createQueryBuilder("post")
            .where("post.parent is NULL")
            .leftJoinAndSelect("post.author", "author")
            .leftJoinAndSelect("post.type", "type")
            .leftJoinAndSelect("type.link", "typelink")
            .leftJoinAndSelect("type.text", "typetext")
            .leftJoinAndSelect("post.tags", "tags")
            .leftJoinAndSelect("tags.canonical", "canonical", "tags.canonical = canonical.id")
            .leftJoinAndSelect("post.parent", "parent");

        if (tli.tag !== "all") {
            query = query.leftJoin("post.tags", "sometags")
                .leftJoin("tag_text", "sometag_text", "sometags.canonical = sometag_text.id")
                .andWhere("sometag_text.slug = :slug", { slug: tli.tag });
        }

        const getOrderBy = (orderBy): [string, any] => {
            switch (orderBy) {
                case SortType.NEWEST:
                case SortType.MOST_REPLIES:
                case SortType.HIGH_SCORE:
                    return ["post.createdAt", "DESC"];
                case SortType.OLDEST:
                    return ["post.createdAt", "ASC"];
            }
        };
        query = query.orderBy(...getOrderBy(tli.sortBy));

        query = query.skip(skip).take(take);

        return query.getMany();
    }

    @Authorized()
    @Mutation(returns => Post)
    async addPost(@Arg("post") postInput: PostInput, @Ctx() { req }: Context): Promise<Post> {

        const user = await findOrCreateUser(req.user);

        const post = await addPostPure(postInput, user, this);

        invalidateCache(post);

        return post;
    }
}
