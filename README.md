# 📖 Bible MCP Server

This repository contains the code for an **MCP (Model Context Protocol) Server** in STDIO mode dedicated to interface with the ACP Agent of your choice.

It's currently implemented with a single tool designed to return a single random bible verse (in french 🥖).

## 🚀 Getting Started (Installation & Setup)

Follow these steps to get the server running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

* **[Language/Runtime]**: E.g., Node.js v18+
* **Git**: For cloning the repository.

### Installation Steps

1. **Clone the Repository:**

    ```bash
    git clone [repository-url]
    cd bible-mcp
    ```

2. **Install Dependencies:**
    Use your project's package manager to install all required libraries and dependencies:

    ```bash
    npm run build
    ```

## ▶️ Usage

Prompt your LLM to `use bible-mcp and get me a bible verse`

It should return a sible verse you can medidate and pray on.

## 🌐 ACP Configuration

for YAML

```yaml
mcpServers:
  - name: bible-mcp
    command: node
    args:
      - "/basolute/path/to/bible-mcp/build/index.js"
    env: {}
```

For JSON

```json
  "mcp": {
    "bible-mcp": {
      "type": "local",
      "enabled": true,
      "command": [
        "node",
        "/basolute/path/to/bible-mcp/build/index.js"
      ]
    }
  }
```

## 📄 License

This project is licensed under the [MIT License](LICENSE)
