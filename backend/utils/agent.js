const Groq = require("groq-sdk");

const { searchCode } = require("../tools/searchCode");
const { readFile } = require("../tools/readFile");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const tools = [
    {
        type: "function",
        function: {
            name: "search_code",
            description:
                "Search the repository for relevant code. Use one simple natural-language query.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description:
                            "A natural-language description of the code to find."
                    }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "read_file",
            description:
                "Read a specific file from the repository.",
            parameters: {
                type: "object",
                properties: {
                    filePath: {
                        type: "string",
                        description:
                            "Relative path of the repository file."
                    }
                },
                required: ["filePath"]
            }
        }
    }
];

async function runAgent(question, repoName) {

    const messages = [
        {
            role: "system",
            content: `
You are a codebase assistant.

Answer questions using ONLY the repository evidence.

For questions asking for an entry point, startup file, mounting,
initialization, or application bootstrapping:

1. Search the repository.
2. Identify the most likely entry-point file.
3. Read that file using read_file.
4. Verify how the application starts or mounts.
5. Only then give the answer.

Do not assume that App.js is the entry point just because it contains
the main application component.

A component such as App.js is NOT automatically the application entry point.

Do not invent information.

Mention the exact file path and explain briefly why it is the entry point.
`
        },
        {
            role: "user",
            content: question
        }
    ];

    for (let i = 0; i < 2; i++) {

        const response = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages,
            tools,
            tool_choice: "auto"
        });

        const message = response.choices[0].message;

        if (!message.tool_calls) {
            return message.content;
        }

        messages.push(message);

        for (const toolCall of message.tool_calls) {

            const args = JSON.parse(
                toolCall.function.arguments
            );

            let result;

            if (toolCall.function.name === "search_code") {

                result = await searchCode(
                    args.query,
                    repoName
                );

            } else if (toolCall.function.name === "read_file") {

                result = await readFile(
                    args.filePath,
                    repoName
                );

            }

            messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result)
            });
        }
    }

    const finalResponse = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
            ...messages,
            {
                role: "user",
                content:
                    "Using only the repository evidence above, answer the original question concisely. Do not use tools."
            }
        ],
        tool_choice: "none"
    });

    return finalResponse.choices[0].message.content;
}

module.exports = {
    runAgent
};