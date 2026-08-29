const fs = require("fs");

const MAX_CHUNK_SIZE = 3000;
const MAX_FILE_SIZE = 100000;
const OVERLAP = 100;

function chunkFile(filePath) {
    const stats = fs.statSync(filePath);

    if (stats.size > MAX_FILE_SIZE) {
        console.log(`Skipping large file: ${filePath}`);
        return [];
    }

    const content = fs.readFileSync(filePath, "utf-8");

    const chunks = [];

    let start = 0;

    while (start < content.length) {
        const end = Math.min(
            start + MAX_CHUNK_SIZE,
            content.length
        );

        chunks.push(content.slice(start, end));

        start += MAX_CHUNK_SIZE - OVERLAP;
    }

    return chunks;
}

module.exports = {
    chunkFile
};