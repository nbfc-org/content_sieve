const password = process.env.TYPEORM_PASSWORD;

export default [
    {
        "name": "default",
        "type": "postgres",
        "username": "postgres",
        "host": "localhost",
        "port": "5432",
        "database": "type-graphql-lazy",
        password,
        "migrations": ["dist/api/src/migrations/*.js"],
        "entities": ["dist/api/src/entities/*.js"],
        "cli": {
            "migrationsDir": "src/migrations",
            "entitiesDir": "src/entities"
        }
    },
    {
        "name": "local",
        "type": "postgres",
        "username": "postgres",
        password,
        "host": "localhost",
        "port": "6432",
        "database": "cs",
        "migrations": ["dist/api/src/migrations/*.js"],
        "entities": ["dist/api/src/entities/*.js"],
        "cli": {
            "migrationsDir": "src/migrations",
            "entitiesDir": "src/entities"
        }
    },
    {
        "name": "staging",
        "type": "postgres",
        "username": "postgres",
        password,
        "host": "localhost",
        "port": "8432",
        "database": "cs",
        "migrations": ["dist/api/src/migrations/*.js"],
        "entities": ["dist/api/src/entities/*.js"],
        "cli": {
            "migrationsDir": "src/migrations",
            "entitiesDir": "src/entities"
        }
    },
    {
        "name": "production",
        "type": "postgres",
        "username": "postgres",
        password,
        "host": "localhost",
        "port": "8732",
        "database": "cs",
        "migrations": ["dist/api/src/migrations/*.js"],
        "entities": ["dist/api/src/entities/*.js"],
        "cli": {
            "migrationsDir": "src/migrations",
            "entitiesDir": "src/entities"
        }
    }
];
