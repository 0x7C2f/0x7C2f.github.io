---
title: How to Use the MCP Server Repository List
layout: post
permalink: /mcp-usage-guide/
---

# How to Use the MCP Server Repository List

This guide explains how to use the MCP server repository list API endpoint and integrate it into various tools and workflows.

## API Endpoint

The MCP server list is available at:
```
https://0x7c2f.github.io/api/mcp-servers.json
```

## Using in VSCode

While VSCode doesn't have native MCP support yet, you can use the API endpoint in several ways:

### 1. Create a VSCode Extension

You can create a VSCode extension that fetches MCP servers from this endpoint:

```typescript
// extension.ts
import * as vscode from 'vscode';
import axios from 'axios';

interface MCPServer {
  name: string;
  description: string;
  repository: string;
  language: string;
  features: string[];
  tags: string[];
}

async function fetchMCPServers(): Promise<MCPServer[]> {
  const response = await axios.get('https://0x7c2f.github.io/api/mcp-servers.json');
  return response.data.servers;
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('mcp.showServers', async () => {
    const servers = await fetchMCPServers();
    
    const quickPick = vscode.window.createQuickPick();
    quickPick.items = servers.map(server => ({
      label: server.name,
      description: server.language,
      detail: server.description
    }));
    
    quickPick.onDidChangeSelection(selection => {
      if (selection[0]) {
        const server = servers.find(s => s.name === selection[0].label);
        if (server) {
          vscode.env.openExternal(vscode.Uri.parse(server.repository));
        }
      }
    });
    
    quickPick.show();
  });

  context.subscriptions.push(disposable);
}
```

### 2. Use with Tasks

Create a VSCode task that queries the API:

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "List MCP Servers",
      "type": "shell",
      "command": "curl -s https://0x7c2f.github.io/api/mcp-servers.json | jq '.servers[] | {name, language, repository}'",
      "problemMatcher": []
    },
    {
      "label": "Search MCP by Tag",
      "type": "shell",
      "command": "curl -s https://0x7c2f.github.io/api/mcp-servers.json | jq '.servers[] | select(.tags[] | contains(\"${input:tag}\")) | {name, description}'",
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "tag",
      "type": "promptString",
      "description": "Enter tag to search for (e.g., database, api, search)"
    }
  ]
}
```

### 3. Snippet Integration

Create snippets that fetch from the API:

```json
// .vscode/mcp.code-snippets
{
  "Fetch MCP Servers": {
    "prefix": "mcp-fetch",
    "body": [
      "const response = await fetch('https://0x7c2f.github.io/api/mcp-servers.json');",
      "const data = await response.json();",
      "const servers = data.servers;",
      "console.log(`Found ${servers.length} MCP servers`);"
    ],
    "description": "Fetch MCP server list from API"
  }
}
```

## Using with Claude Desktop

Claude for Desktop can connect to MCP servers. Here's how to use servers from this list:

### 1. Find a Server

Visit https://0x7c2f.github.io/mcp-servers/ or query the API:

```bash
curl -s https://0x7c2f.github.io/api/mcp-servers.json | jq '.servers[] | {name, repository}'
```

### 2. Install the Server

Clone and install the server:

```bash
# Example: Weather Server
git clone https://github.com/modelcontextprotocol/quickstart-resources
cd quickstart-resources/weather-server-typescript
npm install
npm run build
```

### 3. Configure Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/path/to/weather-server-typescript/build/index.js"]
    }
  }
}
```

### 4. Restart Claude Desktop

The MCP server will now be available in Claude.

## Using Programmatically

### Python

```python
import requests

# Fetch all servers
response = requests.get('https://0x7c2f.github.io/api/mcp-servers.json')
servers = response.json()['servers']

# Filter by language
typescript_servers = [s for s in servers if s['language'] == 'TypeScript']
print(f"Found {len(typescript_servers)} TypeScript servers")

# Filter by tag
database_servers = [s for s in servers if 'database' in s['tags']]
for server in database_servers:
    print(f"- {server['name']}: {server['repository']}")

# Search by keyword
def search_servers(keyword):
    return [s for s in servers if 
            keyword.lower() in s['name'].lower() or 
            keyword.lower() in s['description'].lower() or
            keyword.lower() in ' '.join(s['tags']).lower()]

weather_servers = search_servers('weather')
```

### JavaScript/Node.js

```javascript
const fetch = require('node-fetch');

async function getMCPServers() {
  const response = await fetch('https://0x7c2f.github.io/api/mcp-servers.json');
  const data = await response.json();
  return data.servers;
}

async function filterByTag(tag) {
  const servers = await getMCPServers();
  return servers.filter(s => s.tags.includes(tag));
}

async function searchServers(keyword) {
  const servers = await getMCPServers();
  const lower = keyword.toLowerCase();
  return servers.filter(s => 
    s.name.toLowerCase().includes(lower) ||
    s.description.toLowerCase().includes(lower) ||
    s.tags.some(t => t.includes(lower))
  );
}

// Usage
(async () => {
  const aiServers = await filterByTag('ai');
  console.log(`Found ${aiServers.length} AI-related servers`);
  
  const searchResults = await searchServers('database');
  searchResults.forEach(s => {
    console.log(`${s.name} (${s.language}): ${s.repository}`);
  });
})();
```

### Bash/Shell

```bash
#!/bin/bash

# List all servers
curl -s https://0x7c2f.github.io/api/mcp-servers.json | jq '.servers[].name'

# Get servers by language
curl -s https://0x7c2f.github.io/api/mcp-servers.json | \
  jq '.servers[] | select(.language == "Python") | {name, repository}'

# Get servers by tag
TAG="database"
curl -s https://0x7c2f.github.io/api/mcp-servers.json | \
  jq ".servers[] | select(.tags[] | contains(\"$TAG\")) | {name, description}"

# Count servers by language
curl -s https://0x7c2f.github.io/api/mcp-servers.json | \
  jq '.servers | group_by(.language) | map({language: .[0].language, count: length})'
```

## Building Tools

### CLI Tool

Create a simple CLI for MCP server discovery:

```python
#!/usr/bin/env python3
import requests
import sys
import json

API_URL = 'https://0x7c2f.github.io/api/mcp-servers.json'

def get_servers():
    response = requests.get(API_URL)
    return response.json()['servers']

def list_servers(language=None, tag=None):
    servers = get_servers()
    
    if language:
        servers = [s for s in servers if s['language'] == language]
    if tag:
        servers = [s for s in servers if tag in s['tags']]
    
    for server in servers:
        print(f"\n{server['name']} ({server['language']})")
        print(f"  {server['description']}")
        print(f"  Repository: {server['repository']}")
        print(f"  Tags: {', '.join(server['tags'])}")

def search(keyword):
    servers = get_servers()
    results = [s for s in servers if 
               keyword.lower() in s['name'].lower() or
               keyword.lower() in s['description'].lower()]
    
    for server in results:
        print(f"{server['name']}: {server['repository']}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: mcp-cli [list|search] [options]")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'list':
        language = sys.argv[2] if len(sys.argv) > 2 else None
        list_servers(language=language)
    elif command == 'search':
        if len(sys.argv) < 3:
            print("Usage: mcp-cli search <keyword>")
            sys.exit(1)
        search(sys.argv[2])
```

Save as `mcp-cli`, make executable (`chmod +x mcp-cli`), and use:

```bash
./mcp-cli list TypeScript
./mcp-cli search database
```

### Web Dashboard

Create a simple HTML dashboard:

```html
<!DOCTYPE html>
<html>
<head>
  <title>MCP Server Browser</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .server { border: 1px solid #ddd; padding: 15px; margin: 10px 0; }
    .filter { margin: 20px 0; }
    input, select { padding: 5px; margin-right: 10px; }
  </style>
</head>
<body>
  <h1>MCP Server Browser</h1>
  
  <div class="filter">
    <input type="text" id="search" placeholder="Search servers...">
    <select id="language">
      <option value="">All Languages</option>
    </select>
    <select id="tag">
      <option value="">All Tags</option>
    </select>
  </div>
  
  <div id="servers"></div>

  <script>
    const API_URL = 'https://0x7c2f.github.io/api/mcp-servers.json';
    let allServers = [];

    async function loadServers() {
      const response = await fetch(API_URL);
      const data = await response.json();
      allServers = data.servers;
      
      // Populate filters
      const languages = [...new Set(allServers.map(s => s.language))];
      const languageSelect = document.getElementById('language');
      languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        languageSelect.appendChild(option);
      });
      
      const allTags = [...new Set(allServers.flatMap(s => s.tags))];
      const tagSelect = document.getElementById('tag');
      allTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagSelect.appendChild(option);
      });
      
      displayServers(allServers);
    }

    function displayServers(servers) {
      const container = document.getElementById('servers');
      container.innerHTML = '';
      
      servers.forEach(server => {
        const div = document.createElement('div');
        div.className = 'server';
        div.innerHTML = `
          <h3>${server.name} <small>(${server.language})</small></h3>
          <p>${server.description}</p>
          <p><strong>Features:</strong> ${server.features.join(', ')}</p>
          <p><strong>Tags:</strong> ${server.tags.join(', ')}</p>
          <a href="${server.repository}" target="_blank">View Repository</a>
        `;
        container.appendChild(div);
      });
    }

    function filterServers() {
      const searchTerm = document.getElementById('search').value.toLowerCase();
      const language = document.getElementById('language').value;
      const tag = document.getElementById('tag').value;
      
      let filtered = allServers;
      
      if (searchTerm) {
        filtered = filtered.filter(s => 
          s.name.toLowerCase().includes(searchTerm) ||
          s.description.toLowerCase().includes(searchTerm)
        );
      }
      
      if (language) {
        filtered = filtered.filter(s => s.language === language);
      }
      
      if (tag) {
        filtered = filtered.filter(s => s.tags.includes(tag));
      }
      
      displayServers(filtered);
    }

    document.getElementById('search').addEventListener('input', filterServers);
    document.getElementById('language').addEventListener('change', filterServers);
    document.getElementById('tag').addEventListener('change', filterServers);

    loadServers();
  </script>
</body>
</html>
```

## Integration Examples

### Discord Bot

```python
import discord
import requests

client = discord.Client()

@client.event
async def on_message(message):
    if message.content.startswith('!mcp'):
        args = message.content.split()[1:]
        
        if not args:
            await message.channel.send("Usage: !mcp <search|list|tag> [query]")
            return
        
        response = requests.get('https://0x7c2f.github.io/api/mcp-servers.json')
        servers = response.json()['servers']
        
        if args[0] == 'list':
            msg = f"Found {len(servers)} MCP servers:\n"
            for server in servers[:10]:  # Limit to 10
                msg += f"• {server['name']} ({server['language']})\n"
            await message.channel.send(msg)
        
        elif args[0] == 'search' and len(args) > 1:
            keyword = args[1].lower()
            results = [s for s in servers if keyword in s['name'].lower()]
            msg = f"Search results for '{keyword}':\n"
            for server in results[:5]:
                msg += f"• {server['name']}: {server['repository']}\n"
            await message.channel.send(msg)

client.run('YOUR_BOT_TOKEN')
```

### Slack Bot

```javascript
const { App } = require('@slack/bolt');
const fetch = require('node-fetch');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.command('/mcp', async ({ command, ack, respond }) => {
  await ack();
  
  const response = await fetch('https://0x7c2f.github.io/api/mcp-servers.json');
  const data = await response.json();
  const servers = data.servers;
  
  const [action, ...args] = command.text.split(' ');
  
  if (action === 'search') {
    const keyword = args.join(' ').toLowerCase();
    const results = servers.filter(s => 
      s.name.toLowerCase().includes(keyword) ||
      s.description.toLowerCase().includes(keyword)
    );
    
    const blocks = results.slice(0, 5).map(server => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${server.name}* (${server.language})\n${server.description}\n<${server.repository}|View Repository>`
      }
    }));
    
    await respond({ blocks });
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Slack MCP bot is running!');
})();
```

## Caching and Performance

For production use, consider caching the API response:

```python
import requests
from datetime import datetime, timedelta
import json

class MCPServerCache:
    def __init__(self, cache_duration_minutes=60):
        self.cache_duration = timedelta(minutes=cache_duration_minutes)
        self.cache = None
        self.last_updated = None
    
    def get_servers(self):
        now = datetime.now()
        
        if (self.cache is None or 
            self.last_updated is None or 
            now - self.last_updated > self.cache_duration):
            
            response = requests.get('https://0x7c2f.github.io/api/mcp-servers.json')
            self.cache = response.json()['servers']
            self.last_updated = now
        
        return self.cache

# Usage
cache = MCPServerCache(cache_duration_minutes=30)
servers = cache.get_servers()  # Will use cache if fresh
```

## Next Steps

1. **Explore Servers**: Visit https://0x7c2f.github.io/mcp-servers/ to browse all available servers
2. **Try an MCP Server**: Pick a server and set it up with Claude for Desktop
3. **Build Tools**: Use the API to create your own MCP discovery tools
4. **Contribute**: Add your own MCP servers to the list by submitting a PR

## Resources

- **API Endpoint**: https://0x7c2f.github.io/api/mcp-servers.json
- **Web Interface**: https://0x7c2f.github.io/mcp-servers/
- **MCP Documentation**: https://modelcontextprotocol.io/
- **Example Code**: Check the MCP_SERVERS_README.md file

---

*This API enables programmatic access to a curated list of MCP servers, making it easy to build discovery tools, integrate with VSCode, and create automation workflows.*
