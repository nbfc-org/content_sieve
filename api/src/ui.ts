import * as ApolloSSR from '@vue/apollo-ssr';

export function ui(req, res) {
    res.status(500).end('Internal Server Error');
}
