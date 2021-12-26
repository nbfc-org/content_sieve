## blocks prod

- todo list in sidebar
- add "what is this" page

## next up

- nginx caching of graphql queries?
- server side caching
  - invalidate on login/out
  - move maxAge values into config
  - add back db error traps

## bugs

- http://localhost:4000/new 404s directly

- in unnested mode, showReply applies to all

- load more doesn't refresh everything
- don't reload all data on change
- fix optimistic post responses

## optional below here

- consolidate nginx config

- add summary mode for list / toplevel view

- add user info page

- rate limiting: https://docs.nginx.com/nginx/admin-guide/security-controls/controlling-access-proxied-http/

- admin mode
-- hide posts / soft delete
-- detach / merge threads

- calculate karma from scores & meta votes & vote wilson score
- make meta voting not admin

- look at client side query caching

- terraform cloudflare
- https://frankindev.com/2020/11/18/allow-cloudflare-only-in-nginx/

- vee validate & yup
  - https://vee-validate.logaretm.com/v4/guide/components/validation
  - https://vuetifyjs.com/en/components/forms/#vee-validate
- do a pass on errors, server & client
```
Object { message: "Argument Validation Error", locations: (1) […], path: (1) […], extensions: {…} }
​
extensions: Object { code: "INTERNAL_SERVER_ERROR", exception: {…} }
​​
code: "INTERNAL_SERVER_ERROR"
​​
exception: Object { validationErrors: (1) […], stacktrace: (7) […] }
​​​
stacktrace: Array(7) [ "Error: Argument Validation Error", "    at Object.validateArg (/home/***REMOVED***proj/content_sieve/api/node_modules/type-graphql/dist/resolvers/validate-arg.js:29:15)", "    at processTicksAndRejections (internal/process/task_queues.js:95:5)", … ]
​​​
validationErrors: Array [ {…} ]
​​​​
0: Object { target: {…}, value: "asdfasdfasfdasdfasdfasfdasdfasdfasfdasdfasdfasfdasdfasdfasfdasdfasdfasfdasdfasdfasfdasdfasdfasfdasdfasdfasfdasdfasdfasfdasdfasdfasfdasdfasdfasfd", property: "title", … }
​​​​​
children: Array []
​​​​​
constraints: Object { maxLength: "title must be shorter than or equal to 128 characters" }
​​​​​
property: "title"
​​​​​
target: Object { postId: "3WfHRmvVV08TAoa8MnVnGI", title:
```

- edit for 5 minutes

- query caching in the db using typegraphql
- materialized views
  - https://dba.stackexchange.com/a/191195

- typeorm use views to handle schema changes
- markdown renderer dos: https://marked.js.org/using_advanced#workers
- user sessions

```
// defector: threaded only; newest, oldest, most replies, highest score
// reddit: threaded only; best, top, new, controversial, old, q&a
// metafilter: flat only; oldest first, no matter what
// hn: threaded only; by score only
//
// quatratic weighting ... nth vote costs n^2
//     weighting a vote by the "degree of separation" of the voter? (ie., friends count more)
// hyperbolic discounting of karma acquisition
// limiting the number of voters per item
// new accounts can't vote until achieved a network & karma status (eg., shares, by friends, are upvoted).
// accounts which primarily upvote/downvote outside of their network are ignored
```
