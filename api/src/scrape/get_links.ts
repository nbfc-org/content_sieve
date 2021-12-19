// import { SandboxedJob } from 'bullmq';

import { getRepository } from 'typeorm';
import { createConnection } from 'typeorm';

import { User, Jwt } from "../entities/user.js";
import { Link } from "../entities/link.js";
import { Text } from "../entities/text.js";
import { Mefi } from "../entities/mefi.js";
import { HackerNews } from "../entities/hn.js";
import { Post } from "../entities/post.js";
import { PostType } from "../entities/post_type.js";
import { TopLevelScores, CommentScores } from "../entities/views.js";
import { Vote } from "../entities/vote.js";
import { Tag, TagText } from "../entities/tag.js";

import { addPostPure } from "../helpers.js";

import { config } from "../../../lib/config.js";

import { mefiPosts, hnPosts } from "./osmosis.js";

/*
let created = false;

const cc = async () => {
    if (!created) {
        await createConnection({
            type: "postgres",
            username: "postgres", // fill this with your username
            ...config.db,
            entities: [User, Jwt,
                       Text, Link, Mefi, HackerNews,
                       Post, PostType,
                       Vote,
                       TopLevelScores, CommentScores,
                       Tag, TagText],
        });
        created = true;
    }

};
*/

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
    hn: async (conn) => {

        // TODO: switch to a dedicated hn user
        const user = await conn.userRepository.findOne();

        const { posts } = await hnPosts();

        for (const post of posts) {
            const exists = await conn.hnRepository.findOne({ xid: post.xid });
            if (!exists) {
                const newPost: HackerNews = Object.assign(new HackerNews(), post);
                await addPostPure(newPost, user, conn);
            }
        }
    },
};

export const scrapeHandler = async (job) => {
    const { key } = job.data;
    const dt = new Date();

    console.log(`running "${key}" job ${job.id} at ${dt}`);

    // a new connection w/ bullmq because it was forking
    // await cc();

    const fakeConn = {
        linkRepository: getRepository(Link),
        postRepository: getRepository(Post),
        postTypeRepository: getRepository(PostType),
        textRepository: getRepository(Text),
        tagTextRepository: getRepository(TagText),
        tagRepository: getRepository(Tag),
        mefiRepository: getRepository(Mefi),
        hnRepository: getRepository(HackerNews),
        userRepository: getRepository(User),
    };

    try {
        await jobs[key](fakeConn);
    } catch(e) {
        console.error(e);
    }
};
