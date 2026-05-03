import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as fs from 'fs';
import * as path from "path";

const server = new McpServer({
  name: "bible-mcp-server",
  description: "A bible mcp server returning a random bible verse",
  version: "0.1.0",
});

const BIBLE_DATA_PATH = path.join(__dirname, "data", 'bible-fr.json');
let BIBLE_DATA: string[]

interface BibleData {
    Abbreviation: string;
    Publisher:    string;
    VersionDate:  string;
    IsCompressed: number;
    IsProtected:  number;
    Guid:         string;
    Testaments:   Testament[];
}

interface Testament {
    Books: Book[];
}

interface Book {
    Chapters: Chapter[];
}

interface Chapter {
    Verses: Verse[];
}

interface Verse {
    ID:   number;
    Text: string;
}

function flattenData(data: BibleData): string[] {
    if (!data?.Testaments || !Array.isArray(data.Testaments)) return [];

    // Use flatMap to iterate through Testaments, then Books, Chapters, and Verses sequentially
    const versesText = data.Testaments.flatMap((testamentStructure) => {
        if (!testamentStructure?.Books || !Array.isArray(testamentStructure.Books)) return [];

        return testamentStructure.Books.flatMap((book) => {
            if (!book?.Chapters || !Array.isArray(book.Chapters)) return [];

            return book.Chapters.flatMap((chapter) => {
                if (!chapter?.Verses || !Array.isArray(chapter.Verses)) return [];

                // Extract the Text from each verse object
                return chapter.Verses.map((verse): string => verse.Text);
            });
        });
    });

    return versesText;
}


/**
 * Loads the Bible verse data from the specified JSON file.
 * @returns {string[]} The loaded data object, or an empty object if loading fails.
 */
function loadBibleData(): string[] {
    try {
        if (BIBLE_DATA == null){
            if (!fs.existsSync(BIBLE_DATA_PATH)) {
                console.error(`[FATAL] Bible data file not found at: ${BIBLE_DATA_PATH}`);
                return [];
            }
            let raw_data = fs.readFileSync(BIBLE_DATA_PATH, 'utf8');
            if (raw_data.charCodeAt(0) === 0xFEFF) {
                raw_data = raw_data.slice(1);
            } 

            let data = JSON.parse(raw_data) as BibleData;
            return flattenData(data)
        } else {
            return []
        }
    } catch (error) {
        console.error(`[FATAL] Error loading or parsing bible data : ${(error as Error).message}`);
        return [];
    }
}

/**
 * Randomly selects and returns a Bible verse based on the loaded data.
 * @returns {string} A random verse string.
 */
function getRandomVerse(): string {
    BIBLE_DATA = loadBibleData()
    var data: string[] = BIBLE_DATA

    if (Array.isArray(data) && data.length > 0) {
        return data[Math.floor(Math.random() * data.length)]
    }

    // Fallback if any level is empty or structure is invalid
    console.error("[ERROR] Could not find a valid Bible Verse in the loaded data.");
    return "Verse not found.";
}

server.registerTool(
  "get_random_bible_verse",
  {
    description: "Returns a randomly selected Bible verse."
  },
  async () => {

    return {
      content: [
        {
          type: "text",
          text: getRandomVerse(),
        },
      ],
    };
  },
);

/**
 * Main function to initialize and run the MCP server using stdio.
 */
async function main() {
    try {
        // Initialize the McpServer instance, which handles all required endpoints automatically (like list_tools)
        const transport = new StdioServerTransport();
        await server.connect(transport) // Start listening for stdio commands and processing requests

    } catch (error) {
        console.error("Fatal error starting MCP server:", error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});