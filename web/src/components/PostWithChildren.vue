<template>
  <div>
    hello
    {{ postId }}
  </div>
</template>
<script>
import { getPost } from '../lib/queries.js';
import Post from './Post';

export default {
    components: {
        Post,
    },
    data: function() {
        return {
        };
    },
    methods: {
    },
    props: [
        'postId',
    ],
    apollo: {
        getPost,
    },
};
</script>
