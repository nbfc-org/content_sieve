import { getRepository, getManager } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

import { Vote, VoteType } from "./entities/vote.js";
import { User } from "./entities/user.js";
import { Post } from "./entities/post.js";
import { Text } from "./entities/text.js";
import { Link } from "./entities/link.js";
import { Mefi } from "./entities/mefi.js";
import { PostTypeEnum } from "./entities/post_type.js";
import { Tag, TagText } from "./entities/tag.js";
import { TopLevelScores, CommentScores } from "./entities/views.js";

import { renderMarkdown, splitTags } from '../../lib/validation.js';

import { JSDOM, VirtualConsole } from "jsdom";
import * as createDOMPurify from "dompurify";

import * as cacheManager from "cache-manager";
import { PostInput } from "./resolvers/types/post-input.js";

import * as uuid62 from 'uuid62';

const data = "<html><body></body></html>";
const url = "http://example.com";

const virtualConsole = new VirtualConsole();
virtualConsole.sendTo(console, { omitJSDOMErrors: true });
const jsdom = new JSDOM(data, {
    url,
    virtualConsole
});

const DOMPurify = createDOMPurify(jsdom.window);

export function renderMD(body) {
    return renderMarkdown(body, DOMPurify.sanitize);
}

// TODO: move this to shared memory
const memoryCache = cacheManager.caching({
    store: 'memory',
    max: 10000,
    // ttl: 10, /*seconds*/
});

export async function getSlowPostData(post) {
    let score = 0;
    let replies = -1;
    let depth = -1;
    try {
        const data = await memoryCache.wrap(post.postId, function() {
            return getSlowPostDataFromDB(post);
        });
        ({ score, replies, depth} = data);
    } catch (err) {
        console.error(err);
    }
    return { score, replies, depth };
}

export async function invalidateCache(post) {
    const repo = getManager().getTreeRepository(Post);
    const parents = await repo.findAncestors(post);
    for (const p of parents) {
        memoryCache.del(p.postId, function(err) {
            if (err) {
                console.error(err);
            }
        });
    }
}

async function getSlowPostDataFromDB(post) {
    let score = 0;
    const manager = getManager();
    if (post.parentId) {
        const tls = await manager.findOne(CommentScores, { id: post.id });
        if (tls) {
            score = tls.wilson;
        }
    } else {
        const tls = await manager.findOne(TopLevelScores, { id: post.id });
        if (tls) {
            score = tls.score;
        }
    }
    const repo = manager.getTreeRepository(Post);
    const childrenCount = await repo.countDescendants(post);
    const replies = childrenCount > 0 ? childrenCount - 1 : 0;

    const depth = await repo.countAncestors(post);
    return { score, replies, depth: depth - 1 };
}

type NewPost = PostInput | Mefi;

export async function addPostPure(newPost: NewPost, user: User, conn: any): Promise<Post> {
    let postInput;
    const mf = newPost as Mefi;

    if (mf.xid) {
        postInput = {
            postId: uuid62.v4(),
            tagString: "mefi",
        };
    } else {
        postInput = newPost;
    }

    const post_attrs = {
        postId: uuid62.decode(postInput.postId),
        author: user,
    };

    let post;
    if (postInput.url) {
        // link
        const link = conn.linkRepository.create(
            { url: postInput.url, title: postInput.title },
        );
        await conn.linkRepository.save(link);

        const type = conn.postTypeRepository.create(
            { postType: PostTypeEnum.LINK, contentId: link.id },
        );

        type.link = link;

        post = conn.postRepository.create({...post_attrs, type});
        await conn.postRepository.save(post);

    } else if (postInput.body) {
        // text
        const text = conn.textRepository.create(
            { body: postInput.body },
        );
        await conn.textRepository.save(text);

        const type = conn.postTypeRepository.create(
            { postType: PostTypeEnum.TEXT, contentId: text.id },
        );

        type.text = text;

        post = conn.postRepository.create({...post_attrs, type});
        await conn.postRepository.save(post);

        if (postInput.parentId) {
            // reply
            post.parent = await conn.postRepository.findOne({ postId: uuid62.decode(postInput.parentId) });
            await conn.postRepository.save(post);
        }
    } else if (mf.xid) {
        // mefi
        const mefi = conn.mefiRepository.create(
            { url: mf.url, xid: mf.xid, links: mf.links }
        );
        await conn.mefiRepository.save(mefi);

        const type = conn.postTypeRepository.create(
            { postType: PostTypeEnum.MEFI, contentId: mefi.id },
        );

        type.mefi = mefi;

        post = conn.postRepository.create({...post_attrs, type});
        await conn.postRepository.save(post);
    }

    if (postInput.tagString) {
        const tags = [];
        for (const slug of splitTags(postInput.tagString)) {
            let tag;
            let tt;
            tt = await conn.tagTextRepository.findOne({slug});
            if (tt) {
                tag = await conn.tagRepository.findOne(
                    { canonical: tt },
                    { relations: ["canonical"] },
                );
            } else {
                tt = conn.tagTextRepository.create({ slug });
                await conn.tagTextRepository.save(tt);
                tag = conn.tagRepository.create({ slugs: [tt], canonical: tt });
                await conn.tagRepository.save(tag);
            }
            tags.push(tag);
        }

        post.tags = tags;
        await conn.postRepository.save(post);
    }
    return post;
}

export async function seedDatabase() {
    const postRepository = getRepository(Post);
    const textRepository = getRepository(Text);
    const linkRepository = getRepository(Link);

    const voteRepository = getRepository(Vote);
    const userRepository = getRepository(User);

    const tagTextRepository = getRepository(TagText);
    const tagRepository = getRepository(Tag);

    const defaultUser = userRepository.create({
        username: "foobar",
    });
    await userRepository.save(defaultUser);

    const tts = tagTextRepository.create([
        { slug: "timing" },
        { slug: "time" },
        { slug: "food" },
    ]);
    await tagTextRepository.save(tts);

    const tags = tagRepository.create([
        { slugs: [tts[0], tts[1]], canonical: tts[1] },
        { slugs: [tts[2]], canonical: tts[2] },
    ]);
    await tagRepository.save(tags);

    const count = 5; // 100;
    for (const i of [...Array(count).keys()]) {
        const texts = textRepository.create([
            { body: 'wat' },
        ]);
        await textRepository.save(texts);

        const links = linkRepository.create([
            { url: 'http://google.com', title: 'Google' },
        ]);
        await linkRepository.save(links);

        const posts = postRepository.create([
            ...links.map(l => { return { link: l, author: defaultUser, postId: uuidv4() }; }),
            ...texts.map(t => { return { text: t, author: defaultUser, postId: uuidv4() }; }),
        ]);
        await postRepository.save(posts);

        posts[1].parent = posts[0];

        const votes = voteRepository.create([
            { type: VoteType.DOWN, user: defaultUser, post: posts[0] },
            { type: VoteType.UP, user: defaultUser, post: posts[1] },
        ]);
        await voteRepository.save(votes);

        if (i > count - 3) {
            posts[0].tags = tags;
        }

        await postRepository.save(posts[0]);
        await postRepository.save(posts[1]);
    }

    return {
        defaultUser,
    };
}

export type Lazy<T extends object> = Promise<T> | T;
