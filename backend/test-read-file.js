require("dotenv").config();

const { readFile } = require("./tools/readFile");

async function test() {
    try {
        const result = await readFile("src/index.js");

        console.log("File:", result.filePath);
        console.log("Content:");
        console.log(result.content);

    } catch (error) {
        console.error("Read file failed:");
        console.error(error);
    }
}

test();