const pool = require("../db");

async function storeChunk(repoName, filePath, chunkText, embedding) {
    const query = `
        INSERT INTO code_chunks
        (repo_name, file_path, chunk_text, embedding)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
    `;

    const result = await pool.query(query, [
        repoName,
        filePath,
        chunkText,
        JSON.stringify(embedding)
    ]);

    return result.rows[0].id;
}

module.exports = {
    storeChunk
};