<template>
  <v-form @submit.prevent="submit">
    <p v-if="errors.length">
      <b>Please correct the following error(s):</b>
      <ul>
        <li class="text-error" v-for="error in errors">{{ error }}</li>
      </ul>
      <v-divider class="mb-3 mt-3" />
    </p>

    <p>
      Please post
      <span class="text-h6 font-weight-bold">either</span>
      a fully composed chunk of
      <TextEditor @saveContent="saveContent" :text="body" :sidebar="sidebar" />
      <span class="text-h6 font-weight-bold">or</span>
      <v-text-field v-model="url" label="a single url" />
      <v-text-field v-model="title" label="with a title" />
    </p>

    <p>
    Optionally, add a whitespace delimited
    <v-text-field v-model="tagString" label="list of tags"/>
    </p>
    and <v-btn type="submit" size="small" color="primary" outlined>
      <v-icon left>{{ mdiPlusBox }}</v-icon>submit
    </v-btn>
    your post. Thank you.
  </v-form>
</template>
<script>
import TextEditor from './TextEditor.vue';
import { addPost } from '../lib/queries.js';
import { validatePost } from '@nbfc/shared/validation.js';

import { useRoute } from 'vue-router';
import { mdiPlusBox } from '@mdi/js';

export default {
    components: {
        TextEditor,
    },
    props: [
        'sidebar',
    ],
    setup() {
        const route = useRoute();
        const { tag } = route.params;
        return { tag };
    },
    data: function() {
        return {
            errors: [],
            title: '',
            url: '',
            mdiPlusBox,
            tagString: this.tag,
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
