const { embedText } = require("../utils/embedder");
const { searchChunks } = require("../utils/searchChunks");

async function searchCode(query, repoName) {
    if (!query || !query.trim()) {
        throw new Error("Search query is required");
    }

    if (!repoName || !repoName.trim()) {
        throw new Error("Repository name is required");
    }

    const queryEmbedding = await embedText(
        query,
        "search_query"
    );

    const results = await searchChunks(
        queryEmbedding,
        repoName,
        3
    );

    return results.map((result) => ({
        filePath: result.file_path,
        code: result.chunk_text.slice(0, 800),
        distance: result.distance
    }));
}

module.exports = {
    searchCode
};