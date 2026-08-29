const { embedText } = require("./embedder");
const { searchChunks } = require("./searchChunks");

async function retrieveContext(question) {
    const queryEmbedding = await embedText(
        question,
        "search_query"
    );

    return await searchChunks(queryEmbedding, 5);
}

module.exports = {
    retrieveContext
};