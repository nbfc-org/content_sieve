import marked from 'marked';
import { sanitize } from 'dompurify';

const splitTags = (tagStr) => {
    return [];
};

const renderMarkdown = (md, fn=sanitize) => {
    return fn(marked(md), {FORBID_TAGS: ['img']});
};

export { splitTags, renderMarkdown };
