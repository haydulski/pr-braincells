# PR-Braincells

MCP test node server for markdown files usage. Every file in the cells folder, written in correct format, might be used to generate helpfull answers.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure server in your IDE of choice

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
      }
    }
  }
}
```