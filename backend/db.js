require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "codebase_assistant",
    password: process.env.POSTGRES_PASSWORD,
    port: 5432
});

module.exports = pool;