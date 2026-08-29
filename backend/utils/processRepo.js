const { walkDirectory } = require("./fileWalker");
const { chunkFile } = require("./chunker");
const { embedText } = require("./embedder");
const { storeChunk } = require("./storeChunk");
const path = require("path");

async function processRepo(repoPath, repoName) {
    const files = walkDirectory(repoPath);
    console.log(`Found ${files.length} files to process.`);

    let totalChunks = 0;
    let skippedFiles = 0;

    for (const filePath of files) {
        try {
            const chunks = chunkFile(filePath);

            if (chunks.length === 0) {
                skippedFiles++;
                continue;
            }

            const relativePath = path.relative(repoPath, filePath);

            for (const chunk of chunks) {
                // skip empty/whitespace-only chunks, wastes an API call otherwise
                if (!chunk.trim()) continue;

                const embedding = await embedText(chunk, "search_document");
                await storeChunk(repoName, relativePath, chunk, embedding);
                totalChunks++;
            }

            console.log(`Processed: ${relativePath} (${chunks.length} chunks)`);

        } catch (err) {
            console.error(`Failed on file: ${filePath}`);
            console.error(err.message);
            // don't crash the whole batch over one bad file, just log and continue
        }
    }

    console.log(`\nDone. Total chunks stored: ${totalChunks}. Files skipped: ${skippedFiles}.`);
}

module.exports = { processRepo };