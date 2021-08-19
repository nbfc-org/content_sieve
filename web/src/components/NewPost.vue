<template>
  <form @submit="submit" novalidate="true" class="reply-form newpost">
    <p v-if="errors.length">
      <b>Please correct the following error(s):</b>
      <ul>
        <li v-for="error in errors">{{ error }}</li>
      </ul>
    </p>

    Give your post a
    <input v-model="title" placeholder="title ..." type="text">
    and make it either a single
    <input v-model="url" placeholder="url ..." type="text">
    or a fully composed chunk of
    <TextEditor @saveContent="saveContent" :text="body" />
    If you'd like, give it a list of
    <input v-model="tagString" placeholder="tags ..." type="text">
    and then
    <input type="submit" value="submit" />
    it!
  </form>
</template>
<script>
import TextEditor from './TextEditor.vue';
import { addPost } from '../lib/queries.js';
import { validatePost } from '../../../lib/validation.js';

export default {
    components: {
        TextEditor,
    },
    data: function() {
        return {
            errors: [],
            title: '',
            url: '',
            tagString: '',
            body: '',
        };
    },
    methods: {
        saveContent: function(content) {
            this.body = content;
        },
        submit: async function(event) {
            let input = {
                body: this.body,
                title: this.title,
                url: this.url,
                tagString: this.tagString,
                parentId: null,
            };

            this.errors = validatePost(input);

            if (this.errors.length) {
                return false;
            }

            const { data: { addPost: { postId } } } = await addPost.bind(this)(event, input);
            this.$router.push({ path: `/post/${postId}` });
            event.preventDefault();
        },
    },
};
</script>
<style>
  .newpost {
    padding: 1em;
  }
</style>
