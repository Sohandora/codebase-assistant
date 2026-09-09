// backend/test-traversal.js
const { readFile } = require("./tools/readFile");

async function test() {
    const repoName = "react-redux-realworld-example-app"; // use whatever repo you actually have indexed/cloned

    const attempts = [
        "../../../etc/passwd",
        "../../../../etc/passwd",
        "..\\..\\..\\etc\\passwd",
        "C:\\Windows\\System32\\config\\SAM",
        "/etc/passwd",
        "../../../../../../../../etc/passwd", // excessive depth, in case shallow guards miss it
    ];

    for (const attempt of attempts) {
        try {
            const result = await readFile(attempt, repoName);
            console.log(`❌ VULNERABLE: "${attempt}" succeeded, returned ${result.content.length} chars`);
        } catch (err) {
            console.log(`✅ Blocked: "${attempt}" → ${err.message}`);
        }
    }
}

test();