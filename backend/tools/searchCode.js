const { embedText } = require("../utils/embedder");
const { searchChunks } = require("../utils/searchChunks");

async function searchCode(query, repoName) {
    if (!query || !query.trim()) {
        throw new Error("Search query is required");
    }

    if (!repoName || !repoName.trim()) {
        throw new Error("Repository name is required");
    }

    const enhancedQuery = `
Find relevant source code for this request.

Search specifically for:
- application entry point
- startup and initialization
- mounting or rendering
- main index files
- ReactDOM.render
- createRoot
- application bootstrapping

Original query:
${query}
`;

    const queryEmbedding = await embedText(enhancedQuery);

    const results = await searchChunks(
        queryEmbedding,
        repoName,
        5
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