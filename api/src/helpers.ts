import { getRepository } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

import { Vote, VoteType } from "./entities/vote.js";
import { User } from "./entities/user.js";
import { Post } from "./entities/post.js";
import { Text } from "./entities/text.js";
import { Link } from "./entities/link.js";
import { Tag, TagText } from "./entities/tag.js";

export async function seedDatabase() {
    const postRepository = getRepository(Post);
    const textRepository = getRepository(Text);
    const linkRepository = getRepository(Link);

    const voteRepository = getRepository(Vote);
    const userRepository = getRepository(User);

    const tagTextRepository = getRepository(TagText);
    const tagRepository = getRepository(Tag);

    const defaultUser = userRepository.create({
        email: "foobar@example.com",
        username: "foobar",
        password: "s3cr3tp4ssw0rd",
    });
    await userRepository.save(defaultUser);

    const tts = tagTextRepository.create([
        { slug: "timing" },
        { slug: "time" },
    ]);
    await tagTextRepository.save(tts);

    const tags = tagRepository.create([
        { slugs: tts, canonical: tts[1] },
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
            ...texts.map(t => { return { text: t, author: defaultUser, postId: uuidv4() }; }),
            ...links.map(l => { return { link: l, author: defaultUser, postId: uuidv4() }; }),
        ]);
        await postRepository.save(posts);

        posts[1].parent = posts[0];

        const votes = voteRepository.create([
            { type: VoteType.DOWN, user: defaultUser, post: posts[0] },
            { type: VoteType.UP, user: defaultUser, post: posts[1] },
        ]);
        await voteRepository.save(votes);

        if (i > count - 3) {
            posts[1].tags = tags;
        }

        await postRepository.save(posts[1]);
    }

    return {
        defaultUser,
    };
}

export type Lazy<T extends object> = Promise<T> | T;
