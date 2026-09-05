const pool = require("../db");

function dedupeByFile(results) {
    const seen = new Map();

    for (const result of results) {
        if (
            !seen.has(result.file_path) ||
            result.distance < seen.get(result.file_path).distance
        ) {
            seen.set(result.file_path, result);
        }
    }

    return Array.from(seen.values())
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);
}

async function searchChunks(queryEmbedding, repoName, limit = 15) {
    const query = `
        SELECT
            id,
            repo_name,
            file_path,
            chunk_text,
            embedding <=> $1::vector AS distance
        FROM code_chunks
        WHERE repo_name = $2
        ORDER BY embedding <=> $1::vector
        LIMIT $3;
    `;

    const result = await pool.query(query, [
        JSON.stringify(queryEmbedding),
        repoName,
        limit
    ]);

    return dedupeByFile(result.rows);
}

module.exports = {
    searchChunks
};