"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const server = new mcp_js_1.McpServer({
    name: "bible-mcp-server",
    description: "A bible mcp server returning a random bible verse",
    version: "0.1.0",
});
const BIBLE_DATA_PATH = path.join(__dirname, "data", 'bible-fr.json');
let BIBLE_DATA;
function flattenData(data) {
    if (!data?.Testaments || !Array.isArray(data.Testaments))
        return [];
    // Use flatMap to iterate through Testaments, then Books, Chapters, and Verses sequentially
    const versesText = data.Testaments.flatMap((testamentStructure) => {
        if (!testamentStructure?.Books || !Array.isArray(testamentStructure.Books))
            return [];
        return testamentStructure.Books.flatMap((book) => {
            if (!book?.Chapters || !Array.isArray(book.Chapters))
                return [];
            return book.Chapters.flatMap((chapter) => {
                if (!chapter?.Verses || !Array.isArray(chapter.Verses))
                    return [];
                // Extract the Text from each verse object
                return chapter.Verses.map((verse) => verse.Text);
            });
        });
    });
    return versesText;
}
/**
 * Loads the Bible verse data from the specified JSON file.
 * @returns {string[]} The loaded data object, or an empty object if loading fails.
 */
function loadBibleData() {
    try {
        if (BIBLE_DATA == null) {
            if (!fs.existsSync(BIBLE_DATA_PATH)) {
                console.error(`[FATAL] Bible data file not found at: ${BIBLE_DATA_PATH}`);
                return [];
            }
            let raw_data = fs.readFileSync(BIBLE_DATA_PATH, 'utf8');
            if (raw_data.charCodeAt(0) === 0xFEFF) {
                raw_data = raw_data.slice(1);
            }
            let data = JSON.parse(raw_data);
            return flattenData(data);
        }
        else {
            return [];
        }
    }
    catch (error) {
        console.error(`[FATAL] Error loading or parsing bible data : ${error.message}`);
        return [];
    }
}
/**
 * Randomly selects and returns a Bible verse based on the loaded data.
 * @returns {string} A random verse string.
 */
function getRandomVerse() {
    BIBLE_DATA = loadBibleData();
    var data = BIBLE_DATA;
    if (Array.isArray(data) && data.length > 0) {
        return data[Math.floor(Math.random() * data.length)];
    }
    // Fallback if any level is empty or structure is invalid
    console.error("[ERROR] Could not find a valid Bible Verse in the loaded data.");
    return "Verse not found.";
}
server.registerTool("get_random_bible_verse", {
    description: "Returns a randomly selected Bible verse."
}, async () => {
    return {
        content: [
            {
                type: "text",
                text: getRandomVerse(),
            },
        ],
    };
});
/**
 * Main function to initialize and run the MCP server using stdio.
 */
async function main() {
    try {
        // Initialize the McpServer instance, which handles all required endpoints automatically (like list_tools)
        const transport = new stdio_js_1.StdioServerTransport();
        await server.connect(transport); // Start listening for stdio commands and processing requests
    }
    catch (error) {
        console.error("Fatal error starting MCP server:", error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
