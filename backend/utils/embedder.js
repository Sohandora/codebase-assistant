const { pipeline } = require("@huggingface/transformers");

let extractor = null;

async function getExtractor() {
    if (!extractor) {
        console.log("Loading embedding model...");

        extractor = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2"
        );

        console.log("Embedding model ready.");
    }

    return extractor;
}

async function embedText(text) {
    if (!text || !text.trim()) {
        throw new Error("Text is required for embedding");
    }

    const model = await getExtractor();

    const output = await model(text, {
        pooling: "mean",
        normalize: true
    });

    return Array.from(output.data);
}

module.exports = {
    embedText
};