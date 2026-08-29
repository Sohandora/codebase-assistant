require("dotenv").config();

const { embedText } = require("./utils/embedder");

async function test() {
    try {
        console.log(
            "Cohere key loaded:",
            process.env.COHERE_API_KEY ? "YES" : "NO"
        );

        const vector = await embedText(
            "function login(email, password) { ... }"
        );

        console.log("Vector length:", vector.length);
        console.log("First 5 values:", vector.slice(0, 5));

    } catch (error) {
        console.error("Embedding failed:");
        console.error(error);
    }
}

test();