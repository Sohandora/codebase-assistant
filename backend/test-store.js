require("dotenv").config();

const path = require("path");

const { chunkFile } = require("./utils/chunker");
const { embedText } = require("./utils/embedder");
const { storeChunk } = require("./utils/storeChunk");

async function test() {
    try {
        const filePath = path.join(
            __dirname,
            "temp-repos",
            "react-cicd-app",
            "eslint.config.js"
        );

        console.log("Reading file:", filePath);

        const chunks = chunkFile(filePath);

        console.log("Number of chunks:", chunks.length);

        for (let i = 0; i < chunks.length; i++) {
            console.log(`Processing chunk ${i + 1}...`);

            const embedding = await embedText(chunks[i]);

            console.log(
                "Embedding length:",
                embedding.length
            );

            const id = await storeChunk(
                "react-cicd-app",
                "eslint.config.js",
                chunks[i],
                embedding
            );

            console.log("Stored chunk with ID:", id);
        }

        console.log("All chunks stored successfully!");

    } catch (error) {
        console.error("Failed:");
        console.error(error);
    }
}

test();