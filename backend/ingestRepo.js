require("dotenv").config();

const path = require("path");

const { walkDirectory } = require("./utils/fileWalker");
const { chunkFile } = require("./utils/chunker");
const { embedText } = require("./utils/embedder");
const { storeChunk } = require("./utils/storeChunk");

async function ingestRepo(repoName) {
    const repoPath = path.join(
        __dirname,
        "temp-repos",
        repoName
    );

    console.log("Repository:", repoPath);

    const files = walkDirectory(repoPath);

    console.log("Files found:", files.length);

    let totalChunks = 0;

    for (const filePath of files) {
        const relativePath = path.relative(
            repoPath,
            filePath
        );

        console.log(`\nProcessing: ${relativePath}`);

        const chunks = chunkFile(filePath);

        console.log("Chunks:", chunks.length);

        for (let i = 0; i < chunks.length; i++) {
            console.log(
                `  Embedding chunk ${i + 1}/${chunks.length}...`
            );

            const embedding = await embedText(
                chunks[i],
                "search_document"
            );

            await storeChunk(
                repoName,
                relativePath,
                chunks[i],
                embedding
            );

            totalChunks++;

            console.log(
                `  Stored chunk. Vector length: ${embedding.length}`
            );
        }
    }

    console.log("\n==============================");
    console.log("INGESTION COMPLETE");
    console.log("==============================");
    console.log("Files:", files.length);
    console.log("Total chunks:", totalChunks);
}

ingestRepo("react-cicd-app")
    .catch((error) => {
        console.error("Ingestion failed:");
        console.error(error);
    });