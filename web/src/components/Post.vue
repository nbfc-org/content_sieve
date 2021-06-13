<template>
    <details open class="comment" :id="`comment-${post.id}`">
        <a href="`comment-${post.id}`" class="comment-border-link">
            <span class="sr-only">Jump to {{ post.id }}</span>
        </a>
        <summary>
            <div class="comment-heading">
                <div class="comment-voting">
                    <button type="button">
                        <span aria-hidden="true">&#9650;</span>
                        <span class="sr-only">Vote up</span>
                    </button>
                    <button type="button">
                        <span aria-hidden="true">&#9660;</span>
                        <span class="sr-only">Vote down</span>
                    </button>
                </div>
                <div class="comment-info">
                    <a href="#" class="comment-author">someguy14</a>
                    <p class="m-0">
                        22 points &bull; {{ new Date(post.createdAt) }}
                        &bull; {{ post.depth }}
                        &bull; {{ post.index }}
                        &bull; {{ post.parent }}
                    </p>
                </div>
            </div>
        </summary>

        <div class="comment-body">
            <p>
              {{ post.content.url ? post.content.title : post.content.body }}
            </p>
            <button type="button" v-on:click="reply" data-toggle="reply-form" :data-target="`comment-${post.id}-reply-form`">Reply</button>
            <button type="button">Flag</button>

            <!-- Reply form start -->
            <form method="POST" class="reply-form d-none" :id="`comment-${post.id}-reply-form`">
                <textarea placeholder="Reply to comment" rows="4"></textarea>
                <button type="submit">Submit</button>
                <button type="button" data-toggle="reply-form" :data-target="`comment-${post.id}-reply-form`">Cancel</button>
            </form>
            <!-- Reply form end -->
        </div>
        <div class="replies">
        </div>
    </details>
</template>

<script>
export default {
    props: ['post'],
    methods: {
        reply: function(event) {
            var target = event.target;
            var replyForm;
            if (target.matches("[data-toggle='reply-form']")) {
                replyForm = document.getElementById(target.getAttribute("data-target"));
                replyForm.classList.toggle("d-none");
            }
        },
   },
}
</script>
