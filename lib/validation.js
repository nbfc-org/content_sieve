import * as marked from 'marked';

import { sanitize } from 'dompurify';

import * as validUrl from 'valid-url';
import * as slug from 'slug';

const splitTags = (tagStr) => {
    return [...new Set(tagStr.split(/\s+/).filter(Boolean).map(w => slug(w)))]
};

const renderMarkdown = (md, fn=sanitize) => {
    return fn(marked(md), {FORBID_TAGS: ['img']});
};

const normalizeUrl = (url) => {
    const u = new Url(url, false);
    return u.toString();
};

const validatePost = (input) => {
    const errors = [];
    const { title, body, url } = input;

    if (!body.length) {
        if (!url.length) {
            errors.push('Post needs either a body or a URL');
        }

    }

    if (url.length) {
        if (!title.length) {
            errors.push('URL needs a title');
        }
    }

    const vu = validUrl.isWebUri(url);

    if (url.length && !vu) {
        errors.push('URL is not valid');
    }

    return errors;
};

export { splitTags, renderMarkdown, validatePost };
