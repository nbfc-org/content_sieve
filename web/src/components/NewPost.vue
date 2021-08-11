<template>
  <div class="reply-form">
    <form class="form1">

      <label :for="`${uuid}_title`">Title</label>
      <input v-model="title" :id="`${uuid}_title`" type="text">

      <label :for="`${uuid}_url`">URL</label>
      <input v-model="url" :id="`${uuid}_url`" type="text">

      <label :for="`${uuid}_body`">Body</label>
      <TextEditor :id="`${uuid}_body`" :text="body" />

      <label :for="`${uuid}_tags`">Tags</label>
      <input v-model="tags" :id="`${uuid}_tags`" type="text">

      <button>Submit</button>
    </form>
  </div>
</template>
<script>
import uuid62 from 'uuid62';
import TextEditor from './TextEditor.vue';
import { splitTags } from '../../../lib/validation.js';

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
            tags: '',
            body: '',
        };
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
