import * as ApolloSSR from '@vue/apollo-ssr';
// import createApp from './app';

export function ui(req, res) {
    /*
    const { app, router, store, apolloProvider } = createApp({
        ssr: true,
    });
    */

    res.status(500).end('Internal Server Error');
}
