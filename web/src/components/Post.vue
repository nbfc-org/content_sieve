<template>
<details open class="comment" :id="`comment-${post.postId}`">
  <a :href="`#comment-${post.postId}`" class="comment-border-link">
    <span class="sr-only">Jump to {{ post.postId }}</span>
  </a>
  <summary>
    <div class="comment-heading">
      <div class="comment-voting">
        <button type="button" v-on:click="up">
          <span aria-hidden="true">&#9650;</span>
          <span class="sr-only">Vote up</span>
        </button>
        <button type="button" v-on:click="down">
          <span aria-hidden="true">&#9660;</span>
          <span class="sr-only">Vote down</span>
        </button>
      </div>
      <div class="comment-info">
        <a href="#" class="comment-author">{{ post.author.username }}</a>
        <p class="m-0">
          <router-link
            :to="`/post/${post.postId}`"
            class="nav-item nav-link"
            active-class="active"
            exact
          >{{ ago(post.createdAt) }}</router-link>
          <span v-if="post.parent">
          &bull; <router-link
            :to="`/post/${post.parent.postId}`"
            class="nav-item nav-link"
            active-class="active"
            exact
            >parent</router-link>
          </span>
          &bull; {{ post.index }}
          &bull; {{ post.votes }}
        </p>
      </div>
    </div>
  </summary>

  <div class="comment-body">
    <p>
      {{ post.content.url ? post.content.title : post.content.body }}
    </p>
    <button type="button" v-on:click="reply" data-toggle="reply-form" :data-target="`comment-${post.postId}-reply-form`">Reply</button>
    <button type="button" v-on:click="flag">Flag</button>

    <!-- Reply form start -->
    <div class="reply-form d-none" :id="`comment-${post.postId}-reply-form`">
      <textarea v-model="newPostContent" placeholder="Reply to comment" rows="4"></textarea>
      <button type="button" v-on:click="postReply" data-toggle="reply-form" :data-target="`comment-${post.postId}-reply-form`">Submit</button>
      <button type="button" v-on:click="reply" data-toggle="reply-form" :data-target="`comment-${post.postId}-reply-form`">Cancel</button>
    </div>
    <!-- Reply form end -->
  </div>
  <div class="replies">
    <Post @reloadPost="reloadPost" :key="`${child.postId}`" v-for="child in children" :thread="thread" :postId="child.postId" :recPost="child" v-if="children" />
  </div>
</details>
</template>

<script>
import uuid62 from 'uuid62';
import { DateTime } from 'luxon';
import { VOTE } from '../lib/queries.js';
import { ADD_POST } from '../lib/queries.js';
export default {
    name: 'Post',
    props: [
        'thread',
        'postId',
        'recPost',
        'versionMap',
    ],
    data: function() {
        return {
            newPostContent: '',
        }
    },
    computed: {
        post: function() {
            if (this.recPost) {
                return this.recPost;
            }
            return this.thread.get(this.postId);
        },
        children: function() {
            if (this.recPost) {
                return this.recPost.children;
            }
            return this.thread.childIds(this.postId);
        },
    },
    methods: {
        ago: function(millis) {
            return DateTime.fromMillis(millis).toRelative();
        },
        reply: function(event) {
            var target = event.target;
            var replyForm;
            if (target.matches("[data-toggle='reply-form']")) {
                replyForm = document.getElementById(target.getAttribute("data-target"));
                replyForm.classList.toggle("d-none");
                replyForm.getElementsByTagName("textarea")[0].focus();
            }
        },
        vote: async function(event, postId, type) {
            try {
                const w = await this.$apollo.mutate({
                    mutation: VOTE,
                    variables: {
                        vote: {
                            postId,
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
            // this.$emit('dirty', event, this.postId);
        },
        flag: function(event) {
            this.vote(event, this.postId, "FLAG");
        },
        up: function(event) {
            this.vote(event, this.postId, "UP");
        },
        down: function(event) {
            this.vote(event, this.postId, "DOWN");
        },
        postReply: function(event) {
            this.addPost(event, this.post, this.newPostContent);
        },
        reloadPost: function(cache, post) {
            this.$emit('reloadPost', cache, post);
        },
        addPost: async function(event, parent, content) {
            const id = uuid62.v4();
            try {
                const new_post = await this.$apollo.mutate({
                    mutation: ADD_POST,
                    variables: {
                        post: {
                            postId: id,
                            body: content,
                            parentId: parent.postId,
                            index: parent.index,
                        }
                    },
                    update: (cache, result) => {
                        this.$emit('reloadPost', cache, parent);
                    },
                });
                this.newPostContent = '';
                this.reply(event);
            } catch(err) {
                // this.error = err;
                console.error(err);
            }
                /*
                // refresh all posts on mutation
                update: (data) => {
                this.$apollo.queries.postsByUser.refetch();
                },
                */
                /*
                update: updateAddPost.bind(this),
                optimisticResponse: {
                    __typename: 'Mutation',
                    addPost: {
                        __typename: 'Post',
                        postId: id,
                        parent: {
                            __typename: 'Post',
                            postId: parent.postId,
                        },
                        author: {
                            __typename: 'User',
                            // TODO: unhardcode this when auth exists
                            username: "foobar",
                        },
                        content: {
                            __typename: 'Text',
                            body: content,
                        },
                        votes: [],
                        createdAt: Date.now(),
                        index: [...parent.index, 0],
                    },
                },
                */
        },
   },
}
</script>
