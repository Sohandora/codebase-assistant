const { embedText } = require("./embedder");
const { searchChunks } = require("./searchChunks");

async function retrieveContext(question, repoName) {
    if (!question || !question.trim()) {
        throw new Error("Question is required");
    }

    if (!repoName || !repoName.trim()) {
        throw new Error("Repository name is required");
    }

    const queryEmbedding = await embedText(
        question,
        "search_query"
    );

    return await searchChunks(
        queryEmbedding,
        repoName,
        5
    );
}

module.exports = {
    retrieveContext
};