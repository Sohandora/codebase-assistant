const express = require("express");
const cors = require("cors");
require("dotenv").config();

const repoRoute = require("./routes/repo");
const askRoute = require("./routes/ask");
const agentRoute = require("./routes/agent");
const Groq = require("groq-sdk");

const app = express();

app.use(cors({
    origin: "https://co-b18e7180f7124381b7758038b6d8a535.ecs.us-east-1.on.aws"
}));

app.use(express.json());

app.use("/api", repoRoute);
app.use("/api", askRoute);
app.use("/api", agentRoute);

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "message is required"
            });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: message
                }
            ],
            model: "openai/gpt-oss-120b"
        });

        const reply = completion.choices[0].message.content;

        res.json({
            reply
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "something broke"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});