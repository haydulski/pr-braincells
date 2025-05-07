import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import ContentManager from "./ContentManager.js";
import config from './config.js';

const debugPrint = (message: string) => {
    console.error(`DEBUG: ${message}`);
};

let contentManager: ContentManager | null = null;

// Create server instance
const server = new McpServer({
    name: "pr-braincells",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});


// register specific tools
server.tool(
    "get-by-tag",
    "Get knowledge cels in markdown format by their tags",
    {
        tag: z.string().describe("Tag name for searching knowledge content"),
    },
    async ({ tag }) => {
        if (!contentManager) {
            return {
                content: [
                    { type: "text", text: "No content manager found" },
                ]
            };
        }

        const files = contentManager.getByTag(tag);

        return {
            content: [
                { type: "text", text: `Getting markdown files for tags: ${tag}` },
            ],
        };
    },
);

server.tool(
    'get-tags-list',
    'Get a list of all tags in the content',
    async () => {
        debugPrint("Getting tags list " + config.celsDirectory);
        if (!contentManager) {
            return {
                content: [
                    { type: "text", text: "No content manager found" },
                ]
            };
        }

        return {
            content: [
                { type: "text", text: contentManager.listAllTags() },
            ]
        };
    }
)

async function main() {
    contentManager = new ContentManager();
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error("Profitroom Braincells MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});