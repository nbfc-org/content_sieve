<template>
  <div class="editor">
    <textarea v-model="input" rows="15" placeholder="Write text or markdown here ..." @input="update"></textarea>
    <div class="markdown-body" v-html="compiledMarkdown"></div>
  </div>
</template>
<script>
import { debounce } from 'lodash-es';
import { renderMarkdown } from '../../../lib/validation.js';

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
            return renderMarkdown(this.input);
        },
    },
    methods: {
        update: debounce(function(e) {
            this.$emit('saveContent', e.target.value);
        }, 100),
    },
}
</script>
