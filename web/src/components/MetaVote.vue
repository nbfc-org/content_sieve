<template>
  <v-data-table
    :headers="headers"
    :items="getVotes"
    :items-per-page="5"
    class="elevation-1"
  ></v-data-table>
</template>
<script>

import { mapState } from 'vuex';
import { getVotes } from '../lib/queries.js';

export default {
    computed: {
    },
    data: function() {
        return {
            getVotes: [],
            headers: [
                { text: 'Date', value: 'date' },
                { text: 'Type', value: 'type' },
                { text: 'Post ID', value: 'post.postId' },
                { text: 'Text', value: 'post.content.rendered' },
                { text: 'URL', value: 'post.content.url' },
            ],
        };
    },
    apollo: {
        getVotes,
    },
};
</script>
