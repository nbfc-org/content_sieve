<template>
  <v-btn
    :color="color"
    x-small
    outlined
    @click="click"
    >
    <v-icon left dark>{{ icon }}</v-icon>{{ which }}
  </v-btn>
</template>
<script>

import { VOTE } from '../lib/queries.js';

export default {
    props: [
        'postId',
        'voteId',
        'which',
    ],
    computed: {
        color() {
            return this.which === 'flag' ? "red" : "deep-purple";
        },
        icon() {
            const s = this.which === 'flag' ? this.which : `arrow-${this.which}`;
            return `mdi-${s}`;
        },
    },
    methods: {
        vote: async function(event, postId, voteId, type) {
            try {
                const w = await this.$apollo.mutate({
                    mutation: VOTE,
                    variables: {
                        vote: {
                            postId,
                            voteId,
                            type,
                        }
                    },
                    update: (cache, result) => {
                        this.$emit('reloadPost', cache, result.data.vote);
                    },
                });
            } catch(err) {
                // this.error = err;
                console.error(err);
            }
        },
        click: function(event) {
            this.vote(event, this.postId, this.voteId, this.which.toUpperCase());
        },
    },
};
</script>
