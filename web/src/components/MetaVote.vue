<template>
  <v-data-table
    :headers="headers"
    :items="getVotes"
    :items-per-page="5"
    class="elevation-1"
    >
    <template v-slot:item.vote="{ item }">
      <VoteButton :voteId="item.voteId" which="up" />
      <VoteButton :voteId="item.voteId" which="down" />
    </template>
    <template v-slot:item.post.postId="{ item }">
      <router-link
          :to="`/post/${item.post.postId}`"
          active-class="active"
          exact
        >{{ item.post.postId }}</router-link>
    </template>
  </v-data-table>
</template>
<script>

import { mapState } from 'vuex';
import { getVotes } from '../lib/queries.js';
import VoteButton from './VoteButton.vue';

export default {
    components: {
        VoteButton,
    },
    computed: {
    },
    data: function() {
        return {
            getVotes: [],
            headers: [
                { text: 'Date', value: 'date' },
                { text: 'Type', value: 'type' },
                { text: 'Vote ID', value: 'voteId' },
                /*
                  { text: 'Post ID', value: 'post.postId' },
                  { text: 'Text', value: 'post.content.rendered' },
                  { text: 'URL', value: 'post.content.url' },
                  { text: 'Vote', value: 'vote' },
                */
            ],
        };
    },
    apollo: {
        getVotes,
    },
};
</script>
