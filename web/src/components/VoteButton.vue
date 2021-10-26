<template>
  <v-btn
    :color="color"
    x-small
    plain
    @click="click"
    >
    <v-icon left dark>{{ icon }}</v-icon>{{ which }}
  </v-btn>
</template>
<script>

import { VOTE } from '../lib/queries.js';

import { mdiArrowDown, mdiArrowUp, mdiFlag } from '@mdi/js';

const icon_map = {
    down: mdiArrowDown,
    up: mdiArrowUp,
    flag: mdiFlag,
};

export default {
    props: [
        'postId',
        'voteId',
        'which',
    ],
    data: function() {
        return {
            mdiArrowDown,
        };
    },
    computed: {
        color() {
            return this.which === 'flag' ? "error" : "secondary";
        },
        icon() {
            return icon_map[this.which];
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
