# PR-Braincells

MCP test node server for markdown files usage. Every file in the cells folder, written in correct format, might be used to generate helpfull answers.

## Setup

1. Clone the repository
2. Create `.env`
3. Run: `make dev`
4. Refer to Makefile: `make help`
5. Configure server in your IDE of choice

## Environment Variables

- `CELLS_DIRECTORY`: Directory containing knowledge cells markdown files

## Build
```
npm run build
``` 
## mcp.json configuration

```
{
  "mcpServers": {
    "pr-braincells": {
      "command": "node",
      "args": [
        "/full-path-to-project/build/index.js"
      ],
      "env": {
        "CELLS_DIRECTORY": "/full-path-to-project/cells"
      },
      "alwaysAllow": [
        "query"
      ]
    }
  }
}

```

## TO DO:

### FEATURES

- Handle multi tags query
- Provide mechanism to selects most adequate file from those having same tag
- Split cells into separate folders with dedicated tools (for example: get-by-tag-pms from cells/pms folder)
- Check that file content is provided in best way by method ```_formatContentForOutput```

### OTHER

- Find out way to import pages from Confluence as markdown, [we can test this plugin](https://marketplace.atlassian.com/apps/1221351/markdown-exporter-for-confluence?tab=reviews&hosting=cloud)