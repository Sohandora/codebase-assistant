require("dotenv").config();

const { processRepo } = require("./utils/processRepo");
const path = require("path");

async function test() {
    const repoPath = path.join(
        __dirname,
        "temp-repos",
        "react-redux-realworld-example-app"
    );

    await processRepo(
        repoPath,
        "react-redux-realworld-example-app"
    );
}

test();