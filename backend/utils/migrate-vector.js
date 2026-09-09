require("dotenv").config();
const pool = require("./db");

async function migrate() {
    try {
        await pool.query(`
            ALTER TABLE code_chunks
            DROP COLUMN embedding;
        `);

        await pool.query(`
            ALTER TABLE code_chunks
            ADD COLUMN embedding vector(384);
        `);

        console.log("Embedding column changed to vector(384)");
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

migrate();