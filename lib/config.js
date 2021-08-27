const env = process.env.NODE_ENV || "development";

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
        graphql: process.env.DEV_WEB_GRAPHQL || 'http://localhost:4001',
    },
};

const production = {
    api: {
        port: parseInt(process.env.PROD_API_PORT),
    },
    db: {
        host: process.env.PROD_DB_HOST || 'postgres',
        port: parseInt(process.env.PROD_DB_PORT) || 5432,
        database: process.env.PROD_DB_NAME || 'postgres',
        password: process.env.PROD_DB_PASSWORD
    },
    web: {
        graphql: process.env.POI_APP_PROD_WEB_GRAPHQL,
    },
};

export const config = {
    development,
    production,
}[env];
