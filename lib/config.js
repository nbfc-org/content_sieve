export const env = process.env.POI_APP_NODE_ENV || process.env.NODE_ENV || "development";

const development = {
    api: {
        port: parseInt(process.env.DEV_API_PORT) || 4001,
    },
    db: {
        host: process.env.DEV_DB_HOST || 'localhost',
        port: parseInt(process.env.DEV_DB_PORT) || 5432,
        database: process.env.DEV_DB_NAME || 'type-graphql-lazy',
        password: process.env.DEV_DB_PASSWORD || 'wat',
        logger: "advanced-console",
        logging: "all",
        maxQueryExecutionTime: 1000,
    },
    web: {
        graphql: process.env.DEV_WEB_GRAPHQL || 'http://localhost:4001/graphql',
    },
    scrape: {
        /*
        repeatEvery: 10000000,
        connection: {},
        */
        enabled: true,
        jobs: {
            mefi: {
                cron: '6-59/23 * * * *',
            },
            hn: {
                cron: '3-59/17 * * * *',
            },
        },
        boss: {
            host: 'localhost',
            port: 6432,
            database: 'boss_development',
            password: process.env.DEV_BOSS_DB_PASSWORD || 'eeDe3Aem',
        },
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
        password: process.env.API_DB_PASSWORD,
        logger: "simple-console",
        logging: ["error", "warn"],
        maxQueryExecutionTime: 1000,
    },
    web: {
        graphql: process.env.POI_APP_WEB_GRAPHQL,
    },
    scrape: {
        /*
        repeatEvery: 27 * 60, // seconds
        connection: {
            host: 'job_queue',
        },
        */
        enabled: false,
        boss: {
            host: 'localhost',
            port: 6432,
            database: 'boss_local',
            password: process.env.API_DB_PASSWORD,
        },
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
    keycloak: {
        url: 'https://staging.nbfc.org/auth',
        realm: 'content-sieve-staging',
        clientId: 'content-sieve-staging-vue',
        issuer: 'http://staging.nbfc.org/auth/realms/content-sieve-staging',
        jwksUri: 'http://keycloak:8080/auth/realms/content-sieve-staging/protocol/openid-connect/certs',
    },
    scrape: {
        enabled: true,
        jobs: {
            mefi: {
                cron: '5-59/22 * * * *',
            },
            hn: {
                cron: '4-59/18 * * * *',
            },
        },
        boss: {
            host: process.env.API_DB_HOST || 'postgres',
            port: parseInt(process.env.API_DB_PORT) || 5432,
            database: 'boss_staging',
            password: process.env.API_DB_PASSWORD,
        },
    },
};

const production = {
    ...local,
    keycloak: {
        url: 'https://nbfc.org/auth',
        realm: 'content-sieve-production',
        clientId: 'content-sieve-production-vue',
        issuer: 'http://nbfc.org/auth/realms/content-sieve-production',
        jwksUri: 'http://keycloak:8080/auth/realms/content-sieve-production/protocol/openid-connect/certs',
    },
};

export const config = {
    development,
    local,
    staging,
    production,
}[env];
