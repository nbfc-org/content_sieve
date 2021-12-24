const password = process.env.TYPEORM_PASSWORD;

const common = {
    "migrations": ["dist/src/migrations/*.js"],
    "entities": ["dist/src/entities/*.js"],
    "cli": {
        "migrationsDir": "src/migrations",
        "entitiesDir": "src/entities"
    },
};

export default [
    {
        "name": "default",
        "type": "postgres",
        "username": "postgres",
        "host": "localhost",
        "port": "5432",
        "database": "type-graphql-lazy",
        password,
        ...common,
    },
    {
        "name": "local",
        "type": "postgres",
        "username": "postgres",
        password,
        "host": "localhost",
        "port": "6432",
        "database": "cs",
        ...common,
    },
    {
        "name": "staging",
        "type": "postgres",
        "username": "postgres",
        password,
        "host": "localhost",
        "port": "8432",
        "database": "cs",
        ...common,
    },
    {
        "name": "production",
        "type": "postgres",
        "username": "postgres",
        password,
        "host": "localhost",
        "port": "8732",
        "database": "cs",
        ...common,
    }
];
