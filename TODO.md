- user sessions / settings
- add user page w/ info & settings

- digital ocean / terraform / cloudflare
- authenticated origin CA / origin pulls

- scrape top of hn / mefi into cs

- add sorting on PostsWithTag page
- add summary mode for list / toplevel view
- via css, make top level post obvious

- add paging
  - https://github.com/typeorm/typeorm/blob/master/docs/select-query-builder.md#using-pagination
  - https://www.howtographql.com/vue-apollo/9-pagination/
- add meta-moderation of votes
- move "hide all" back into "-"

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

- reload for deeper than 4 levels
- look at client side query caching
- don't reload all data on change
- nginx caching of graphql queries?

- edit for 5 minutes

- vuetify themes?
- app nav bar / drawer

- materialized views
  - https://dba.stackexchange.com/a/191195

- typeorm use views to handle schema changes
- ssr
- markdown renderer dos: https://marked.js.org/using_advanced#workers

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
