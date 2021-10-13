import { getRepository, getManager } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

import { Vote, VoteType } from "./entities/vote.js";
import { User } from "./entities/user.js";
import { Post } from "./entities/post.js";
import { Text } from "./entities/text.js";
import { Link } from "./entities/link.js";
import { Tag, TagText } from "./entities/tag.js";
import { TopLevelScores, CommentScores } from "./entities/views.js";

import { renderMarkdown } from '../../lib/validation.js';

import { JSDOM, VirtualConsole } from "jsdom";
import * as createDOMPurify from "dompurify";

import * as cacheManager from "cache-manager";

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
    let replies = 0;
    try {
        const data = await memoryCache.wrap(post.postId, function() {
            return getSlowPostDataFromDB(post);
        });
        ({ score, replies} = data);
    } catch (err) {
        console.error(err);
    }
    return { score, replies };
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
    return { score, replies };
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
