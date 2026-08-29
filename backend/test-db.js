require("dotenv").config();          // load env FIRST
const pool = require("./db");         // THEN create the pool

console.log("Raw password from env:", JSON.stringify(process.env.POSTGRES_PASSWORD));
console.log("Password loaded:", !!process.env.POSTGRES_PASSWORD);
console.log("Password length:", process.env.POSTGRES_PASSWORD?.length);

async function test() {
    try {
        const result = await pool.query("SELECT NOW()");
        console.log("Database connected!");
        console.log("Database time:", result.rows[0].now);
    } catch (error) {
        console.error("Database connection failed:");
        console.error(error);
    } finally {
        await pool.end();
    }
}

test();