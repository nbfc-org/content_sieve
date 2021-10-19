const env = process.env.POI_APP_NODE_ENV || process.env.NODE_ENV || "development";

const development = {
    api: {
        port: parseInt(process.env.DEV_API_PORT) || 4001,
    },
    db: {
        host: process.env.DEV_DB_HOST || 'localhost',
        port: parseInt(process.env.DEV_DB_PORT) || 5432,
        database: process.env.DEV_DB_NAME || 'type-graphql-lazy',
        password: process.env.DEV_DB_PASSWORD || 'wat',
    },
    web: {
        graphql: process.env.DEV_WEB_GRAPHQL || 'http://localhost:4001/graphql',
    },
    keycloak: {
        url: 'http://localhost:28080/auth',
        realm: 'content-sieve-dev',
        clientId: 'content-sieve-local-vue',
        issuer: 'http://localhost:28080/auth/realms/content-sieve-dev',
        jwksUri: 'http://localhost:28080/auth/realms/content-sieve-dev/protocol/openid-connect/certs',
    },
};

// local, fully dockerized
const local = {
    api: {
        port: parseInt(process.env.API_PORT),
    },
    db: {
        host: process.env.API_DB_HOST || 'postgres',
        port: parseInt(process.env.API_DB_PORT) || 5432,
        database: process.env.API_DB_NAME,
        password: process.env.API_DB_PASSWORD
    },
    web: {
        graphql: process.env.POI_APP_WEB_GRAPHQL,
    },
    keycloak: {
        url: 'http://localhost:8080/auth',
        realm: 'content-sieve-dev',
        clientId: 'content-sieve-local-vue',
        issuer: 'http://localhost:8080/auth/realms/content-sieve-dev',
        jwksUri: 'http://keycloak:8080/auth/realms/content-sieve-dev/protocol/openid-connect/certs',
    },
};

const staging = {
    ...local,
};

export const config = {
    development,
    local,
    staging,
}[env];
