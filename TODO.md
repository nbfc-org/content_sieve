- typegraphql authz including roles
  - https://github.com/MichalLytek/type-graphql/tree/master/examples/authorization
  - https://github.com/MichalLytek/type-graphql/blob/master/examples/authorization/resolver.ts
- migrate to keycloak
  - https://github.com/keycloak/keycloak-quickstarts/blob/latest/applications/app-vue/src/main.js
  - https://github.com/keycloak/keycloak-nodejs-admin-client

- user sessions
- proper authors coming from auth service

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

- add sorting on PostsWithTag page

- add paging
- add meta-moderation of votes
- move "hide all" back into "-"
- reload for deeper than 3 levels
- edit for 5 minutes

- add summary mode for list / toplevel view

- character limit (reddit 40k)
- typeorm use views to handle schema changes
- ssr
- don't reload all data on change
- nginx caching of graphql queries?
- markdown renderer dos: https://marked.js.org/using_advanced#workers
- vee validate & yup
  - https://vee-validate.logaretm.com/v4/guide/components/validation
  - https://vuetifyjs.com/en/components/forms/#vee-validate
