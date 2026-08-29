const fs = require("fs");
const path = require("path");

const ALLOWED_EXTENSIONS = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".py",
    ".java",
    ".json",
    ".md"
];

const IGNORED_DIRS = [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    "coverage",
    "temp-repos"
];
const IGNORED_FILES = [
    "package-lock.json"
];

function walkDirectory(dirPath, fileList = []) {
    const entries = fs.readdirSync(dirPath, {
        withFileTypes: true
    });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {

            if (!IGNORED_DIRS.includes(entry.name)) {
                walkDirectory(fullPath, fileList);
            }

        } else {

    const ext = path.extname(entry.name);

    if (
        ALLOWED_EXTENSIONS.includes(ext) &&
        !IGNORED_FILES.includes(entry.name)
    ) {
        fileList.push(fullPath);
    }
}
    }

    return fileList;
}

module.exports = {
    walkDirectory
};