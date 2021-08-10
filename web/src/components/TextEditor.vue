<template>
  <div class="editor">
    <textarea v-model="input" rows="15" placeholder="Write text or markdown here ..." @input="update"></textarea>
    <div class="markdown-body" v-html="compiledMarkdown"></div>
  </div>
</template>
<script>
import marked from 'marked';
import _ from 'lodash';
import { sanitize } from 'dompurify';

export default {
    props: [
        'text',
    ],
    data: function() {
        return {
            input: this.text,
        }
    },
    computed: {
        compiledMarkdown: function() {
            return sanitize(marked(this.input), {FORBID_TAGS: ['img']});
        },
    },
    methods: {
        update: _.debounce(function(e) {
            this.$emit('saveContent', e.target.value);
        }, 100),
    },
}
</script>
