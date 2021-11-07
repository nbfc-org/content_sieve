import * as osmosis from 'osmosis';

function mefiLinks() {
    return new Promise<Array<string>>((resolve, reject) => {
        let results = [];
        osmosis
            .get('https://www.metafilter.com')
            .find('div.copy a@href')
            .set('link')
            .data(item => {
                results.push(item.link);
            })
            .done(() => resolve(results));
    });
}

function linksToPosts(links) {
    let curPostId;
    const posts = {};
    for (const link of links.reverse()) {
        const r = /^\/(\d+?)\//;
        const m = r.exec(link);
        // console.log(link);
        if (m && m[1]) {
            curPostId = m[1];
            if (!posts[curPostId]) {
                posts[curPostId] = {
                    url: link,
                    links: [],
                };
            }
            // console.log(postId);
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

const mefiBody = ([k, v]) => {
    const links = v.links.map(l => `- [${l}](${l})`);
    const body = `
### MetaFilter [post ${k}](https://www.metafilter.com${v.url})

${links.join("\n")}
`;
    return { body, id: k };
};

export async function mefiPosts() {
    const links: Array<string> = await mefiLinks();
    const posts = Object.entries(linksToPosts(links)).map(mefiBody);
    return { posts, tagString: 'mefi' };
}
