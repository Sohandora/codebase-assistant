require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function listModels() {
    try {
        const models = await groq.models.list();

        console.log("Available models:");

        models.data.forEach((model) => {
            console.log(model.id);
        });

    } catch (error) {
        console.error("Failed to get models:");
        console.error(error);
    }
}

listModels();