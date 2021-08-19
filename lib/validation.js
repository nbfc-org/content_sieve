import marked from 'marked';

import pkg from 'dompurify';
const { sanitize } = pkg;

const splitTags = (tagStr) => {
    return tagStr.split(/[ ,]+/).filter(Boolean);
};

const renderMarkdown = (md, fn=sanitize) => {
    return fn(marked(md), {FORBID_TAGS: ['img']});
};

const validatePost = (input) => {
    const errors = [];

    if (!input.title.length) {
        errors.push('Post needs a title');
    }

    if (!input.body.length) {
        errors.push('Body should have text');
    }

    return errors;
};

export { splitTags, renderMarkdown, validatePost };
