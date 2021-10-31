<template>
  <v-form @submit.prevent="submit">
    <p v-if="errors.length">
      <b>Please correct the following error(s):</b>
      <ul>
        <li v-for="error in errors">{{ error }}</li>
      </ul>
    </p>

    <p>
      Please post either a fully composed chunk of
      <TextEditor @saveContent="saveContent" :text="body" />
      <strong>or</strong> a single
      <v-text-field v-model="url" placeholder="url ..." />
      with a
      <v-text-field v-model="title" placeholder="title ..." type="text" />
    </p>

    <p>
    Optionally, add a whitespace delimited list of
    <v-text-field v-model="tagString" placeholder="tags ..." />
    </p>
    Then
    <v-btn type="submit" color="primary" outlined>submit</v-btn>
    your post. Thank you.
  </v-form>
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

            event.preventDefault();

            try {
                const { data: { addPost: { postId } } } = await addPost.bind(this)(event, input);
                this.$router.push({ path: `/post/${postId}` });
            } catch(e) {
                console.error(e);
            }
        },
    },
};
</script>
