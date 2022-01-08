<template>
      <v-btn
        :color="color"
        size="x-small"
        :icon="icon"
        @click="click"
        v-bind="props"
        />
</template>
<script>

import { VOTE } from '../lib/queries.js';

import { mdiFlagOutline, mdiFlag } from '@mdi/js';
import { mdiArrowUpBoldOutline, mdiArrowUpBold } from '@mdi/js';
import { mdiArrowDownBoldOutline, mdiArrowDownBold } from '@mdi/js';
/*
  <v-tooltip>
  <template v-slot:activator="{ props }">
  </template>
  <span>Vote {{ which }}</span>
  </v-tooltip>
  <div>
    */
const icon_map = {
    down: {
        no: mdiArrowDownBoldOutline,
        yes: mdiArrowDownBold,
    },
    up: {
        no: mdiArrowUpBoldOutline,
        yes: mdiArrowUpBold,
    },
    flag: {
        no: mdiFlagOutline,
        yes: mdiFlag,
    },
};

export default {
    props: {
        'postId': {},
        'voteId': {},
        'which': {
            type: String,
            required: true,
        },
        'vote': {
            default: () => {},
            type: Object,
        },
    },
    computed: {
        color() {
            return this.which === 'flag' ? "error" : "secondary";
        },
        icon() {
            const type = this.vote && this.vote.type.toLowerCase();
            const toggle = type == this.which ? 'yes' : 'no';
            return icon_map[this.which][toggle];
        },
    },
    methods: {
        makeVote: async function(event, postId, voteId, type) {
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
            this.makeVote(event, this.postId, this.voteId, this.which.toUpperCase());
        },
    },
};
</script>
