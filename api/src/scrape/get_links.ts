import { SandboxedJob } from 'bullmq';

import { getRepository } from 'typeorm';
import { createConnection } from 'typeorm';

import { User, Jwt } from "../entities/user.js";
import { Link } from "../entities/link.js";
import { Text } from "../entities/text.js";
import { Mefi } from "../entities/mefi.js";
import { Post } from "../entities/post.js";
import { PostType } from "../entities/post_type.js";
import { TopLevelScores, CommentScores } from "../entities/views.js";
import { Vote } from "../entities/vote.js";
import { Tag, TagText } from "../entities/tag.js";

import { addPostPure } from "../helpers.js";

import { config } from "../../../lib/config.js";

import { mefiPosts } from "./osmosis.js";

let created = false;

const cc = async () => {
    if (!created) {
        await createConnection({
            type: "postgres",
            username: "postgres", // fill this with your username
            ...config.db,
            entities: [User, Jwt,
                       Text, Link, Mefi,
                       Post, PostType,
                       Vote,
                       TopLevelScores, CommentScores,
                       Tag, TagText],
            logger: "advanced-console",
            logging: "all",
        });
        created = true;
    }

};

const jobs = {
    mefi: async (conn) => {

        // TODO: switch to a dedicated mefi user
        const user = await conn.userRepository.findOne();

        const latest = await conn.mefiRepository.findOne({ order: { xid: "DESC" }});

        const latest_xid = latest ? latest.xid : 0;

        const { posts } = await mefiPosts();

        for (const post of posts) {
            if (post.xid > latest_xid) {
                const newPost: Mefi = Object.assign(new Mefi(), post);
                await addPostPure(newPost, user, conn);
            }
            else {
                break;
            }
        }
    },
};

module.exports = async (job: SandboxedJob) => {
    const { key } = job.data;

    await cc();

    const fakeConn = {
        linkRepository: getRepository(Link),
        postRepository: getRepository(Post),
        postTypeRepository: getRepository(PostType),
        textRepository: getRepository(Text),
        tagTextRepository: getRepository(TagText),
        tagRepository: getRepository(Tag),
        mefiRepository: getRepository(Mefi),
        userRepository: getRepository(User),
    };

    await jobs[key](fakeConn);
}
;
