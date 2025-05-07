# PR-Braincels

MCP test node server for markdown files usage. Every file in the celss folder, written in correct format, might be used to generate helpfull answers.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure server in your IDE of choice

## Environment Variables

- `CELS_DIRECTORY`: Directory containing knowledge cells markdown files

## Build
```
npm run build
``` 
## mcp.json configuration

```
{
  "mcpServers": {
    "pr-braincels": {
      "command": "node",
      "args": [
        "/full-path-to-project/build/index.js"
      ],
      "env": {
        "CELS_DIRECTORY": "/full-path-to-project/cels"
      }
    }
  }
}
```