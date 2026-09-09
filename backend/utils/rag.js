const { embedText } = require("./embedder");
const { searchChunks } = require("./searchChunks");

async function retrieveContext(question, repoName) {
    if (!question || !question.trim()) {
        throw new Error("Question is required");
    }

    if (!repoName || !repoName.trim()) {
        throw new Error("Repository name is required");
    }

    const enhancedQuestion = `
Find the source code file responsible for the main application entry point,
startup, initialization, mounting or rendering of the application.

Question: ${question}

Relevant code concepts:
main entry point, index.js, index.tsx, index.jsx,
ReactDOM.render, createRoot, render, application startup
`;

    const queryEmbedding = await embedText(enhancedQuestion);

    return await searchChunks(
        queryEmbedding,
        repoName,
        5
    );
}

module.exports = {
    retrieveContext
};