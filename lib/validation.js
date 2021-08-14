import marked from 'marked';

import pkg from 'dompurify';
const { sanitize } = pkg;

const splitTags = (tagStr) => {
    return [];
};

const renderMarkdown = (md, fn=sanitize) => {
    return fn(marked(md), {FORBID_TAGS: ['img']});
};

export { splitTags, renderMarkdown };
