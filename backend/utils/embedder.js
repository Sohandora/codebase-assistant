const { CohereClient } = require("cohere-ai");

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY
});

async function embedText(text, inputType = "search_document") {
    const response = await cohere.embed({
        texts: [text],
        model: "embed-english-v3.0",
        inputType: inputType
    });

    return response.embeddings[0];
}

module.exports = {
    embedText
};