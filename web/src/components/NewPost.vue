<template>
  <form class="reply-form">
    <label :for="`${uuid}_title`">Title</label>
    <input v-model="title" :id="`${uuid}_title`" type="text">

    <label :for="`${uuid}_url`">URL</label>
    <input v-model="url" :id="`${uuid}_url`" type="text">

    <label :for="`${uuid}_body`">Body</label>
    <TextEditor :id="`${uuid}_body`" @saveContent="saveContent" :text="body" />

    <label :for="`${uuid}_tagString`">Tags</label>
    <input v-model="tagString" :id="`${uuid}_tagString`" type="text">

    <button v-on:click="submit">Submit</button>
  </form>
</template>
<script>
import uuid62 from 'uuid62';
import TextEditor from './TextEditor.vue';
import { addPost } from '../lib/queries.js';

export default {
    mounted() {
        this.uuid = uuid62.v4();
    },
    components: {
        TextEditor,
    },
    data: function() {
        return {
            uuid: null,
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
            const { data: { addPost: { postId } } } = await addPost.bind(this)(event, input);
            this.$router.push({ path: `/post/${postId}` });
        },
    },
};
</script>
<style scoped>
form {
  display: grid;
  padding: 1em;
  border: 1px solid #c1c1c1;
  margin: 2rem auto 0 auto;
  max-width: 600px;
  padding: 1em;
}
form input {
  border: 1px solid #9c9c9c;
}
form button {
  padding: 0.7em;
  width: 100%;
  border: 0;
}
form button:hover {
  background: gold;
}

label {
  padding: 0.5em 0.5em 0.5em 0;
}

input {
  padding: 0.7em;
  margin-bottom: 0.5rem;
}
input:focus {
  outline: 3px solid gold;
}

@media (min-width: 400px) {
  form {
    grid-template-columns: 5em 1fr;
    grid-gap: 1em;
  }

  label {
    text-align: right;
    grid-column: 1 / 2;
  }

  input,
  button {
    grid-column: 2 / 3;
  }
}
</style>
