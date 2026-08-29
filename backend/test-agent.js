require("dotenv").config();

const Groq = require("groq-sdk");
const { searchCode } = require("./tools/searchCode");
const { readFile } = require("./tools/readFile");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const tools = [
    {
        type: "function",
        function: {
            name: "search_code",
            description:
                "Search the indexed codebase for relevant code chunks based on a natural language query. Returns file paths and code snippets ranked by relevance.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description:
                            "The search query describing what code to find"
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
                "Read the full contents of a specific file from the repository, given its relative file path.",
            parameters: {
                type: "object",
                properties: {
                    filePath: {
                        type: "string",
                        description:
                            "Relative path to the file, e.g. src/index.js"
                    }
                },
                required: ["filePath"]
            }
        }
    }
];

async function executeToolCall(toolCall) {
    const args = JSON.parse(toolCall.function.arguments);

    if (toolCall.function.name === "search_code") {
        const results = await searchCode(args.query);
        return JSON.stringify(results);
    }

    if (toolCall.function.name === "read_file") {
        const result = await readFile(args.filePath);
        return JSON.stringify(result);
    }

    return `Unknown tool: ${toolCall.function.name}`;
}

async function runAgent(question) {
    const messages = [
        {
            role: "system",
            content: `
You are a codebase assistant that answers questions about the indexed repository.

Rules:

1. Use search_code when you need to locate relevant code.
2. Use read_file when you need to inspect a specific file in detail.
3. Use tools only when they provide information needed to answer the question.
4. Prefer one strong search rather than multiple broad searches.
5. If you have found relevant files and enough evidence to answer, stop using tools.
6. Do not repeatedly search for additional confirmation when the existing evidence is sufficient.
7. Do not invent file paths, code, or project behavior.
8. Base your answer only on evidence from the repository.
9. You have a maximum of 4 tool iterations. Use them efficiently.
10. Give a clear, concise final answer and mention relevant file paths.
`
        },
        {
            role: "user",
            content: question
        }
    ];

    // Tool-use phase
    for (let iteration = 0; iteration < 4; iteration++) {

        console.log(`\n--- Iteration ${iteration + 1} ---`);

        const response = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages,
            tools,
            tool_choice: "auto"
        });

        const message = response.choices[0].message;

        // Model decided it already has enough information
        if (!message.tool_calls || message.tool_calls.length === 0) {
            return message.content;
        }

        console.log(
            `Model requested ${message.tool_calls.length} tool call(s):`
        );

        for (const toolCall of message.tool_calls) {
            console.log("Tool:", toolCall.function.name);
            console.log("Arguments:", toolCall.function.arguments);
        }

        // Add assistant's tool-call message to conversation
        messages.push(message);

        // Execute requested tools
        for (const toolCall of message.tool_calls) {
            let result;

            try {
                result = await executeToolCall(toolCall);
            } catch (err) {
                result = `Tool execution failed: ${err.message}`;
            }

            messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: result
            });
        }
    }

    // Final-answer phase
    console.log("\n--- Final Answer Phase ---");

    const finalResponse = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
            ...messages,
            {
                role: "user",
                content: `
You have reached the tool-use limit.

Using the repository evidence already collected above,
provide the best possible answer to the original question.

Do not call any tools.
Do not invent information.
Clearly mention the relevant file paths.
`
            }
        ],
        tool_choice: "none"
    });

    return finalResponse.choices[0].message.content;
}

async function test() {
    try {
        const answer = await runAgent(
            "How is authentication handled in this application?"
        );

        console.log("\nFinal answer:");
        console.log(answer);

    } catch (error) {
        console.error("Agent failed:");
        console.error(error);
    }
}

test();