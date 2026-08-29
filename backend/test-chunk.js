const { chunkFile } = require("./utils/chunker");
const { walkDirectory } = require("./utils/fileWalker");
const path = require("path");

const repoPath = path.join(
    __dirname,
    "temp-repos",
    "react-cicd-app"
);

const files = walkDirectory(repoPath);

console.log("Number of files:", files.length);

const firstFile = files[0];

console.log("Testing on:", firstFile);

const chunks = chunkFile(firstFile);

console.log("Number of chunks:", chunks.length);

console.log(
    "First chunk preview:",
    chunks[0]?.slice(0, 200)
);