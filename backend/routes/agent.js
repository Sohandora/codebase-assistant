const express = require("express");
const { runAgent } = require("../utils/agent");

const router = express.Router();

router.post("/agent", async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                error: "question is required"
            });
        }

        const answer = await runAgent(question);

        res.json({
            answer
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "agent failed",
            details: err.message
        });
    }
});

module.exports = router;