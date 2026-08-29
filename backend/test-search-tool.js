require("dotenv").config();

const { searchCode } = require("./tools/searchCode");

async function test() {
    try {
        const results = await searchCode(
            "Where is Redux store configured?"
        );

        console.log("Search results:");

        results.forEach((result, index) => {
            console.log(`\nResult ${index + 1}`);
            console.log("File:", result.filePath);
            console.log("Distance:", result.distance);
            console.log("Code:", result.code.slice(0, 300));
        });

    } catch (error) {
        console.error("Search tool failed:");
        console.error(error);
    }
}

test();