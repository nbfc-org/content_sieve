import * as osmosis from 'osmosis';
import { HackerNews } from '../entities/hn';

import axios from 'axios';
import * as cheerio from 'cheerio';

async function mefiLinks() {
    const url = 'https://www.metafilter.com';

    const { data } = await axios.get(url)

    const c = cheerio.load(data)

    return c('div.copy a').map(
        (i, e) => e.attribs.href
    ).get();
    /*
    return new Promise<Array<string>>((resolve, reject) => {
        let results = [];
        osmosis
            .get('https://www.metafilter.com')
            .find('div.copy a@href')
            .set('link')
            .data(item => {
                results.push(item.link);
            })
            .error(err => reject(err))
            .done(() => resolve(results));

    });
    */
}

function linksToPosts(links) {
    let curPostId;
    const posts = {};
    for (const link of links.reverse()) {
        const r = /^\/(\d+?)\//;
        const m = r.exec(link);
        if (m && m[1]) {
            curPostId = m[1];
            if (!posts[curPostId]) {
                posts[curPostId] = {
                    url: link,
                    links: [],
                };
            }
        } else {
            const u = /^\/user\/(\d+?)$/;
            const um = u.exec(link);
            if (um && um[1]) {
                posts[curPostId].user = um[1];
            } else {
                posts[curPostId].links.push(link);
            }
        }
    }
    return posts;
}

const mefiObj = ([k, v]) => {
    return { xid: k, links: v.links, url: v.url };
};

export async function mefiPosts() {
    const links: Array<string> = await mefiLinks();
    const posts = Object.entries(linksToPosts(links)).map(mefiObj);
    return { posts };
}

async function hnLinks() {
    const url = 'https://news.ycombinator.com/news';

    const { data } = await axios.get(url)

    const c = cheerio.load(data)

    const objs = c('tr.athing').map(
        (i, e) => {
            const td = c('td', e).get()[2];
            const link = c('a', td).get()[0];
            return {
                xid: e.attribs.id,
                links: [link.attribs.href],
            };
        }
    ).get().reverse();
    return objs;
    /*
    return new Promise<Array<string>>((resolve, reject) => {
        let results = [];
        osmosis
            .get('https://news.ycombinator.com/news')
            .find('tr.athing')
            .set({
                link: "td[3] a@href",
                xid: "@id",
            })
            .data(item => {
                results.push({ xid: item.xid, links: [item.link] });
            })
            .error(err => reject(err))
            .done(() => resolve(results));
    });
    */
}

export async function hnPosts() {
    const posts: Array<any> = await hnLinks();
    return { posts };
}
