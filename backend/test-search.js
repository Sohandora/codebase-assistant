require("dotenv").config();

const { embedText } = require("./utils/embedder");
const { searchChunks } = require("./utils/searchChunks");

async function test() {
    try {
const question = "Where is the main React application entrypoint?";

        console.log("Question:", question);

        
        const queryEmbedding = await embedText(
            question,
            "search_query"
        );

        console.log(
            "Question embedding length:",
            queryEmbedding.length
        );

        const results = await searchChunks(
            queryEmbedding,
            5
        );

        console.log("\nSearch results:");

        results.forEach((result, index) => {
            console.log(`\nResult ${index + 1}`);
            console.log("File:", result.file_path);
            console.log("Distance:", result.distance);
            console.log("Code:", result.chunk_text.slice(0, 300));
        });

    } catch (error) {
        console.error("Search failed:");
        console.error(error);

    }
}

test();