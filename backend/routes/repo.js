const express = require("express");
const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");
const { walkDirectory } = require("../utils/fileWalker");

const router = express.Router();

router.post("/repo", async (req, res) => {
    try {
        const { repoUrl } = req.body;

        if (!repoUrl) {
            return res.status(400).json({
                error: "repoUrl is required"
            });
        }

        const repoName = repoUrl
            .split("/")
            .pop()
            .replace(".git", "");

        const clonePath = path.join(
            __dirname,
            "..",
            "temp-repos",
            repoName
        );

        if (fs.existsSync(clonePath)) {
            fs.rmSync(clonePath, {
                recursive: true,
                force: true
            });
        }

        const git = simpleGit();

        await git.clone(repoUrl, clonePath);
        const files = walkDirectory(clonePath);

            res.json({
        message: "cloned successfully",
        path: clonePath,
        repoName,
        fileCount: files.length,
        files: files.map(file =>
            path.relative(clonePath, file)
        )
    });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "clone failed",
            details: error.message
        });
    }
});

module.exports = router;