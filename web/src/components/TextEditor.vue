<template>
  <div class="editor">
    <textarea v-model="input" rows="15" placeholder="plain text or markdown ..." @input="update"></textarea>
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
<style scoped>
.editor {
  margin: .5em 0;
  height: 100%;
  border: 1px solid #ccc;
}

.editor textarea, .editor div {
  display: inline-block;
  width: 49%;
  height: 100%;
  vertical-align: top;
  box-sizing: border-box;
}

.editor textarea {
  border: none;
  border-right: 1px solid #ccc;
  outline: none;
  background-color: #f6f6f6;
  font-size: 14px;
  font-family: "Monaco", courier, monospace;
  padding: 1em;
}
</style>
