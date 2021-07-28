import { getRepository } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

import { Vote, VoteType } from "./entities/vote.js";
import { User } from "./entities/user.js";
import { Post } from "./entities/post.js";
import { Text } from "./entities/text.js";
import { Link } from "./entities/link.js";

export async function seedDatabase() {
    const postRepository = getRepository(Post);
    const textRepository = getRepository(Text);
    const linkRepository = getRepository(Link);

    const voteRepository = getRepository(Vote);
    const userRepository = getRepository(User);

    const defaultUser = userRepository.create({
        email: "foobar@example.com",
        username: "foobar",
        password: "s3cr3tp4ssw0rd",
    });
    await userRepository.save(defaultUser);

    for (const i of [...Array(100).keys()]) {
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
        await postRepository.save(posts[1]);

        const votes = voteRepository.create([
            { type: VoteType.DOWN, user: defaultUser, post: posts[0] },
            { type: VoteType.UP, user: defaultUser, post: posts[1] },
        ]);
        await voteRepository.save(votes);
    }

    return {
        defaultUser,
    };
}

export type Lazy<T extends object> = Promise<T> | T;
