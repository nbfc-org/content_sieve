<template>
  <div class="editor">
    <textarea :class="$vuetify.breakpoint.xs ? 'vertical' : 'horizontal'" v-model="input" ref="area" rows="8" placeholder="plain text or markdown ..." @input="update"></textarea>
    <div :class="$vuetify.breakpoint.xs ? 'vertical markdown-body' : 'horizontal markdown-body'" v-html="compiledMarkdown"></div>
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
    mounted: function() {
        this.$refs["area"].focus();
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
  height: 100%;
  vertical-align: top;
  box-sizing: border-box;
  padding: .5em;
}

.editor .horizontal {
  width: 49%;
}

.editor .vertical {
  width: 100%;
  min-height: 6em;
}

.editor textarea.vertical {
  border-bottom: 1px solid #ccc;
}

.editor textarea.horizontal {
  border-right: 1px solid #ccc;
}

.editor textarea {
  border: none;
  outline: none;
  background-color: #f6f6f6;
  font-size: 14px;
  font-family: "Monaco", courier, monospace;
}
</style>
