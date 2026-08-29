require("dotenv").config();

const Groq = require("groq-sdk");
const { retrieveContext } = require("./utils/rag");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function test() {
    try {
const question =
    "Where are the project dependencies defined?";

        console.log("Question:", question);

        // 1. Search PostgreSQL for relevant code
        const results = await retrieveContext(question);

        console.log("\nRetrieved files:");

        results.forEach((result, index) => {
            console.log(
                `${index + 1}. ${result.file_path} | distance: ${result.distance}`
            );
        });

        // 2. Turn retrieved chunks into context
        const context = results
            .map((result) => {
                return `
--- ${result.file_path} ---
${result.chunk_text}
`;
            })
            .join("\n");

        // 3. Send question + code context to Groq
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a helpful codebase assistant. Answer questions using the provided code context. If the answer cannot be found in the context, say you cannot find it."
                },
                {
                    role: "user",
                    content: `
Question:
${question}

Code context:
${context}
`
                }
            ]
        });

        const answer =
            completion.choices[0].message.content;

        console.log("\nAI Answer:");
        console.log(answer);

    } catch (error) {
        console.error("RAG test failed:");
        console.error(error);
    }
}

test();