export const env = process.env.NODE_ENV || "development";

const apiCache = {
    cache: {
        defaultMaxAge: 60,
        authedVotesMaxAge: 30,
    },
};

const development = {
    api: {
        port: parseInt(process.env.DEV_API_PORT) || 4001,
        ...apiCache,
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
        graphql: 'http://localhost:4001/graphql',
    },
    scrape: {
        enabled: false,
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

// localdocker, fully dockerized
const localdocker = {
    ...development,
    api: {
        port: parseInt(process.env.API_PORT),
        ...apiCache,
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
        graphql: '/api',
    },
    scrape: {
        enabled: false,
        jobs: {
            mefi: {
                cron: '* * * * *',
            },
            hn: {
                cron: '* * * * *',
            },
        },
        boss: {
            host: 'postgres',
            port: 5432,
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
    ...localdocker,
    web: {
        graphql: 'https://staging.nbfc.org/api',
    },
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
                cron: '25 * * * *',
            },
            hn: {
                cron: '37 * * * *',
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
    ...localdocker,
    web: {
        graphql: 'https://nbfc.org/api',
    },
    keycloak: {
        url: 'https://nbfc.org/auth',
        realm: 'content-sieve-production',
        clientId: 'content-sieve-production-vue',
        issuer: 'http://nbfc.org/auth/realms/content-sieve-production',
        jwksUri: 'http://keycloak:8080/auth/realms/content-sieve-production/protocol/openid-connect/certs',
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
            database: 'boss_production',
            password: process.env.API_DB_PASSWORD,
        },
    },
};

export const config = {
    development,
    localdocker,
    staging,
    production,
}[env];
