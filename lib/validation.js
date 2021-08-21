import marked from 'marked';

import pkg from 'dompurify';
const { sanitize } = pkg;

import validUrl from 'valid-url';

const splitTags = (tagStr) => {
    return tagStr.split(/[ ,]+/).filter(Boolean);
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

    if (!title.length) {
        errors.push('Post needs a title');
    }

    if (!body.length) {
        if (!url.length) {
            errors.push('Post needs a URL or a body');
        }
    }
    const vu = validUrl.isWebUri(url);

    if (url.length && !vu) {
        errors.push('URL is not valid');
    }

    return errors;
};

export { splitTags, renderMarkdown, validatePost };
