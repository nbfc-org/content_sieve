import marked from 'marked';

import dompurify from 'dompurify';

import validUrl from 'valid-url';
import slug from 'slug';

const splitTags = (tagStr, sl=slug) => {
    return [...new Set(tagStr.split(/\s+/).filter(Boolean).map(w => sl(w)))]
};

const renderMarkdown = (md, san=dompurify.sanitize, mar=marked) => {
    return san(mar(md), {FORBID_TAGS: ['img']});
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
