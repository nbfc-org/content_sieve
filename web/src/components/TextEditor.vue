<template>
  <div class="editor">
    <textarea :value="input" :class="horizontal ? 'horizontal' : 'vertical'" ref="area" rows="8" placeholder="plain text or markdown ..." @input="update"></textarea>
    <div :class="horizontal ? 'horizontal markdown-body' : 'vertical markdown-body'" v-html="compiledMarkdown"></div>
  </div>
</template>
<script>
import { renderMarkdown } from '@nbfc/shared/validation.js';
import { useDisplay } from 'vuetify';

export default {
    props: [
        'text',
        'narrow',
    ],
    setup() {
        const { smAndUp } = useDisplay();

        return { smAndUp };
    },
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
        horizontal: function() {
            if (this.narrow) {
                return false;
            }
            return this.smAndUp;
        },
    },
    methods: {
        update: function(e) {
            this.input = e.target.value;
            this.$emit('saveContent', this.input);
        },
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
