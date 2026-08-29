const fs = require("fs");
const path = require("path");

async function readFile(filePath) {
    if (!filePath || !filePath.trim()) {
        throw new Error("File path is required");
    }

    const repoRoot = path.resolve(
        __dirname,
        "..",
        "temp-repos",
        "react-redux-realworld-example-app"
    );

    const fullPath = path.resolve(repoRoot, filePath);

    // Prevent reading files outside the repository
    if (!fullPath.startsWith(repoRoot + path.sep)) {
        throw new Error("Access denied: file is outside the repository");
    }

    if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const stats = fs.statSync(fullPath);

    if (!stats.isFile()) {
        throw new Error("Path is not a file");
    }

    const content = fs.readFileSync(fullPath, "utf-8");

    return {
        filePath,
        content
    };
}

module.exports = {
    readFile
};