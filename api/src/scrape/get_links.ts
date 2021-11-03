import { SandboxedJob } from 'bullmq';

import { getRepository } from 'typeorm';
import { createConnection } from 'typeorm';

import * as uuid62 from 'uuid62';

import { User, Jwt } from "../entities/user.js";
import { Link } from "../entities/link.js";
import { Text } from "../entities/text.js";
import { Post } from "../entities/post.js";
import { TopLevelScores, CommentScores } from "../entities/views.js";
import { Vote } from "../entities/vote.js";
import { Tag, TagText } from "../entities/tag.js";

import { addPostPure } from "../helpers.js";

import { config } from "../../../lib/config.js";

let created = false;

const cc = async () => {
    if (!created) {
        await createConnection({
            type: "postgres",
            username: "postgres", // fill this with your username
            ...config.db,
            entities: [User, Jwt, Text, Link, Post, Vote,
                       TopLevelScores, CommentScores,
                       Tag, TagText],
            logger: "advanced-console",
            logging: "all",
        });
        created = true;
    }

};

module.exports = async (job: SandboxedJob) => {
    const { url } = job.data;

    // console.log(url);
    return;

    await cc();

    const fakeConn = {
        linkRepository: getRepository(Link),
        postRepository: getRepository(Post),
        textRepository: getRepository(Text),
        tagTextRepository: getRepository(TagText),
    };
    const postInput = {
        url,
        title: 'Fake Title',
        postId: uuid62.v4(),
    };
    const user = await getRepository(User).findOne();

    const post = await addPostPure(postInput, user, fakeConn);

    console.log(post);

};
