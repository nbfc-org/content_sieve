<template>
  <v-card v-if="post.content" flat class="rounded-0">
    <div :id="post.postId" />
    <details class="comment" open>
      <v-row dense>
        <v-col v-ripple :id="`post-${post.postId}`" :cols="post.tags.length ? 8 : 12">
          <v-card-text v-if="post.content.rendered">
            <div class="markdown-body" v-html="post.content.rendered" />
          </v-card-text>
          <v-card-text v-if="post.content.url">
            <a :href="post.content.url">{{ post.content.title }}</a>
          </v-card-text>
        </v-col>
        <v-col cols="3" v-if="post.tags.length">
          <v-card flat>
            <v-card-text>
            <v-chip
              color="primary"
              class="ml-2"
              variant="outlined"
              size="x-small"
              label
              :key="`tag_${tag.canonical.slug}`"
              v-for="tag in post.tags">
              <v-icon left>
                {{ mdiLabel }}
              </v-icon>
              <router-link
                :to="`/tag/${tag.canonical.slug}`"
                class="text-primary"
                active-class="active"
                exact
                >{{ tag.canonical.slug }}</router-link>
            </v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <summary class="text-secondary bg-grey-lighten-4" @click="details">
        <v-card-text>
        {{ post.author.username }}
        &bull;
        <v-tooltip anchor="bottom center" origin="auto" :activator="`#time_${post.postId}`">
          <template v-slot:activator="{ props }">
            <span :id="`time_${post.postId}`">
              {{ ago }}
            </span>
          </template>
          <span>{{ localTime }}</span>
        </v-tooltip>
        <span v-if="isAdmin()">
          &bull; score: {{ post.score }}
        </span>
        <span v-if="settings.nested && childrenLength">
          &bull; {{ detailsInfo }}
        </span>
        <span v-if="!childrenLength && post.replies !== 0">
          &bull; {{ pluralize("reply", post.replies, true) }}
        </span>
        </v-card-text>
      </summary>
      <v-card-actions>
        <v-item-group>
          <template v-for="(child, index) in buttons(post)" :key="child.name">
            <v-item>
              <v-tooltip anchor="bottom center" origin="auto" :activator="`#${child.id}`">
                <template v-slot:activator="{ props }">
                  <component :is="child.name" :id="child.id" v-bind="child.props" v-on="child.on || {}">
                    <v-icon v-if="child.icon" :color="child.icon.color">
                      {{ child.icon.name }}
                    </v-icon>
                    {{ child.icon.text || '' }}
                  </component>
                </template>
                <span>{{ child.tooltip }}</span>
              </v-tooltip>
            </v-item>
          </template>
        </v-item-group>
      </v-card-actions>
      <v-expand-transition>
        <v-card
          v-if="showReplyForm"
          flat
          class="transition-fast-in-fast-out v-card--reveal"
          style="height: 100%;"
          >
          <v-card-text :id="`comment-${post.postId}-reply-form`">
            <TextEditor @saveContent="saveContent" :key="`${post.postId}_${version}`" :text="newPostContent" />
          </v-card-text>
          <v-card-actions class="pt-0">
            <v-btn
              size="small"
              color="primary"
              @click="postReply"
              >
              <v-icon left dark>{{ mdiPlusBox }}</v-icon>Add reply
            </v-btn>
            <v-btn
              size="small"
              color="error"
              @click="reply"
              >
              <v-icon left>{{ mdiClose }}</v-icon>Close reply
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-expand-transition>
      <v-card-actions v-if="hasMore">
        <v-btn
          size="x-small"
          outlined
          color="primary"
          @click="loadIt"
          >
          <v-icon left dark>{{ mdiDownloadCircle }}</v-icon>Load More
        </v-btn>
      </v-card-actions>
      <div class="replies">
        <Post @reloadPost="reloadPost" @loadMore="loadMore" :key="`${child.postId}`" v-for="child in children" :post="child" :sortBy="sortBy" />
      </div>
    </details>
  </v-card>
</template>

<script>
import { DateTime } from 'luxon';
import { capitalCase } from 'capital-case';

import { addPost, getSort, REPLY_DEPTH } from '../lib/queries.js';

import TextEditor from './TextEditor.vue';
import VoteButton from './VoteButton.vue';
import { mapState } from 'vuex';

import { mdiReply, mdiDownloadCircle, mdiArrowTopLeft, mdiCommentTextMultiple, mdiLink, mdiPlusBox, mdiLabel, mdiClose } from '@mdi/js';

import pluralize from 'pluralize';

export default {
    name: 'Post',
    components: {
        TextEditor,
        VoteButton,
    },
    props: [
        'post',
        'sortBy',
        'showReply',
        'topLevel',
    ],
    data: function() {
        return {
            pluralize,
            mdiReply,
            mdiDownloadCircle,
            mdiCommentTextMultiple,
            mdiLink,
            mdiArrowTopLeft,
            mdiPlusBox,
            mdiLabel,
            mdiClose,
            newPostContent: '',
            version: 0,
            open: true,
            showReplyForm: this.showReply,
            justOnePost: this.topLevel || false
        }
    },
    computed: {
        ...mapState({
            settings: state => {
                const { user } = state.session;
                if (!user) { return {}; }
                return user.settings;
            },
        }),
        detailsInfo: function() {
            const text = `${this.open ? 'hide' : 'show'} ${this.post.replies + 1}`;
            // const text = this.open ? 'hide all' : 'show all';
            return `[${text}]`;
        },
        postId: function() {
            return this.post.postId;
        },
        hasMore: function() {
            return 0;
            // TODO: consider restoring loadMore when apollo actually works
            return !this.justOnePost && this.post.replies > 0 && !this.childrenLength;
        },
        childrenLength: function() {
            return this.post.nested_kids_length || this.children.length;
        },
        children: function() {
            let kids = this.post.children || [];
            if (!this.sortBy) {
                return kids;
            }
            kids = [...kids];
            kids.sort(getSort(this.sortBy));
            return kids;
        },
        ago: function() {
            return DateTime.fromMillis(this.post.createdAt).toRelative();
        },
        localTime: function() {
            return DateTime.fromMillis(this.post.createdAt).toRFC2822();
        },
    },
    methods: {
        showVotes() {
            const authed = this.authed();
            if (!authed) {
                return authed;
            }
            return this.$keycloak.userName != this.post.author.username;
        },
        authed() {
            return this.$keycloak.ready && this.$keycloak.authenticated;
        },
        isAdmin() {
            return this.authed() && this.$keycloak.hasResourceRole('admin');
        },
        ripple: function(el, delay) {
            let ev = new Event("mousedown");
            let offset = el.getBoundingClientRect();
            ev.clientX = offset.left + offset.width/2;
            ev.clientY = offset.top + offset.height/2;
            el.dispatchEvent(ev);

            setTimeout(function() {
                el.dispatchEvent(new Event("mouseup"))
            }, delay);
        },
        gotoParent(postId) {
            const refName = `post-${postId}`;
            const el = document.getElementById(refName);
            if(el) {
                this.$router.push({ hash: `#${postId}` });
                setTimeout(() => this.ripple(el, 800), 400)
            } else {
                this.$router.push({ path: `/post/${postId}` });
            }
        },
        details: function(event) {
            const o = event.currentTarget.parentElement.getAttribute('open');
            this.open = o === null;
        },
        openReply: function(event) {
            if (this.$keycloak.authenticated) {
                this.showReplyForm = true;
            } else {
                const basePath = window.location.toString();
                this.$keycloak.login({ redirectUri: `${window.location.origin}/post/${this.postId}?showReply=true` });
            }
        },
        reply: function(event) {
            this.showReplyForm = false;
        },
        saveContent: function(content) {
            this.newPostContent = content;
        },
        postReply: async function(event) {
            const parentId = this.postId;
            const body = this.newPostContent;
            const new_post = await addPost.bind(this)(event, { parentId, body });
            this.newPostContent = '';
            this.version++;
            this.reply(event);
        },
        reloadPost: function(cache, post) {
            this.$emit('reloadPost', cache, post);
        },
        loadMore: function(postId) {
            this.$emit('loadMore', postId);
        },
        loadIt: function() {
            this.$emit('loadMore', this.postId);
        },
        buttons(p) {
            const replyButton = {
                name: 'VBtn',
                id: `reply_${p.postId}`,
                tooltip: "Reply",
                props: {
                    size: "x-small",
                    // variant: "outlined",
                    'data-target': `comment-${p.postId}-reply-form`,
                },
                icon: {
                    name: mdiReply,
                    color: "primary",
                },
                on: { click: this.openReply },
            };

            const goToPost = {
                name: 'VBtn',
                id: `goto_${p.postId}`,
                tooltip: "View Comments",
                props: {
                    size: "x-small",
                    to: `/post/${p.postId}`,
                },
                icon: {
                    name: mdiCommentTextMultiple,
                    text: p.replies,
                    color: "primary",
                },
            };

            const voteButtons = this.showVotes() ? ["up", "down", "flag"] : [];

            const baseButtons = [];
            if (this.justOnePost) {
                baseButtons.push(goToPost);
            } else if (p.depth < REPLY_DEPTH) {
                baseButtons.push(replyButton);
            }

            const allButtons = [
                ...baseButtons,
                ...voteButtons.map( which => {
                    return {
                        name: 'VoteButton',
                        id: `${which}_${p.postId}`,
                        tooltip: capitalCase(which),
                        props: {
                            postId: p.postId,
                            which,
                            vote: p.votes && p.votes[0],
                        },
                        on: { reloadPost: this.reloadPost },
                    };
                }),
            ];

            if (p.parent) {
                allButtons.push({
                    name: 'VBtn',
                    id: `parent_${p.postId}`,
                    tooltip: "Jump to parent",
                    props: {
                        size: "x-small",
                    },
                    icon: {
                        name: mdiArrowTopLeft,
                        color: "primary",
                    },
                    on: { click: () => this.gotoParent(p.parent.postId) },
                });
            }

            if (!this.justOnePost) {
                allButtons.push({
                    name: 'VBtn',
                    id: `link_${p.postId}`,
                    tooltip: "Permalink",
                    props: {
                        size: "x-small",
                        to: `/post/${p.postId}`,
                    },
                    icon: {
                        name: mdiLink,
                        color: "primary",
                    },
                });
            }

            return allButtons;

        },
    },
}
</script>
