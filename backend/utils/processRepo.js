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

            const relativePath = path.relative(
                repoPath,
                filePath
            );

            for (const chunk of chunks) {

                if (!chunk.trim()) {
                    continue;
                }

                const embedding = await embedText(chunk);

                await storeChunk(
                    repoName,
                    relativePath,
                    chunk,
                    embedding
                );

                totalChunks++;
            }

            console.log(
                `Processed: ${relativePath} (${chunks.length} chunks)`
            );

        } catch (err) {

            console.error(
                `Failed on file: ${filePath}`
            );

            console.error(err.message);
        }
    }

    console.log(
        `\nDone. Total chunks stored: ${totalChunks}. Files skipped: ${skippedFiles}.`
    );
}

module.exports = {
    processRepo
};