# MCP Server Repository List

This repository now hosts a curated list of Model Context Protocol (MCP) servers, available both as a web page and as a JSON API endpoint.

## Features

### 📄 Web Interface
- Human-readable list at [/mcp-servers/](/mcp-servers/)
- Organized display with server details
- Search by language (TypeScript, Python, etc.)
- Search by tags (weather, database, filesystem, etc.)
- Links to repositories and features

### 🔌 JSON API Endpoint
- Public API at `/api/mcp-servers.json`
- Machine-readable format
- Programmatic access to all server data
- Perfect for tools, scripts, and integrations

## Usage

### Accessing the Web Interface

Visit: `https://0x7c2f.github.io/mcp-servers/`

### Accessing the JSON API

```bash
# Using curl
curl https://0x7c2f.github.io/api/mcp-servers.json

# Using wget
wget https://0x7c2f.github.io/api/mcp-servers.json

# Using JavaScript/fetch
fetch('https://0x7c2f.github.io/api/mcp-servers.json')
  .then(response => response.json())
  .then(data => console.log(data));

# Using Python
import requests
response = requests.get('https://0x7c2f.github.io/api/mcp-servers.json')
servers = response.json()
```

### API Response Format

```json
{
  "servers": [
    {
      "name": "Server Name",
      "description": "Brief description",
      "repository": "https://github.com/user/repo",
      "language": "TypeScript",
      "features": [
        "Feature 1",
        "Feature 2"
      ],
      "tags": [
        "tag1",
        "tag2"
      ]
    }
  ]
}
```

## Adding Your MCP Server

To add your MCP server to this list:

1. **Fork this repository**

2. **Edit** `_data/mcp_servers.yml`

3. **Add your server** following this format:

```yaml
- name: "Your Server Name"
  description: "Brief description of what your server does"
  repository: "https://github.com/username/repo"
  language: "TypeScript"  # or Python, Go, etc.
  features:
    - "Feature 1"
    - "Feature 2"
    - "Feature 3"
  tags:
    - "category1"
    - "category2"
```

4. **Submit a pull request**

### Guidelines

- **Name**: Clear, descriptive name
- **Description**: One-line summary of functionality
- **Repository**: Link to the GitHub repository
- **Language**: Primary programming language
- **Features**: 3-5 key features
- **Tags**: Relevant categories for discoverability

## Use Cases

### For Developers
- Discover existing MCP servers
- Find servers by language or functionality
- Contribute your own servers

### For Tools and Services
- Build MCP server registries
- Create discovery tools
- Aggregate server listings
- Build recommendation systems

### Example: Building a Server Discovery Tool

```javascript
// Fetch all MCP servers
async function getAllServers() {
  const response = await fetch('https://0x7c2f.github.io/api/mcp-servers.json');
  const data = await response.json();
  return data.servers;
}

// Filter servers by language
async function getServersByLanguage(language) {
  const servers = await getAllServers();
  return servers.filter(s => s.language === language);
}

// Filter servers by tag
async function getServersByTag(tag) {
  const servers = await getAllServers();
  return servers.filter(s => s.tags.includes(tag));
}

// Usage
const typescriptServers = await getServersByLanguage('TypeScript');
const weatherServers = await getServersByTag('weather');
```

## Integration Examples

### Build a CLI Tool

```bash
#!/bin/bash
# mcp-search.sh - Search MCP servers by tag

TAG=$1
curl -s https://0x7c2f.github.io/api/mcp-servers.json | \
  jq -r ".servers[] | select(.tags[] | contains(\"$TAG\")) | .name"
```

### Create a Discord Bot

```python
import discord
import requests

def get_mcp_servers():
    response = requests.get('https://0x7c2f.github.io/api/mcp-servers.json')
    return response.json()['servers']

@bot.command()
async def mcp_search(ctx, tag: str):
    servers = get_mcp_servers()
    matches = [s for s in servers if tag in s['tags']]
    
    if matches:
        msg = f"Found {len(matches)} MCP servers with tag '{tag}':\n"
        for server in matches:
            msg += f"• {server['name']}: {server['repository']}\n"
    else:
        msg = f"No servers found with tag '{tag}'"
    
    await ctx.send(msg)
```

## Current Statistics

The list currently includes:
- 8 MCP servers
- Languages: TypeScript, Python
- Categories: Weather, Filesystem, Database, API, Memory, Search, Storage

## Related Resources

- [MCP Server Guide](/mcp-servers-github-pages/) - Learn about MCP and hosting
- [MCP Official Documentation](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Example MCP Servers](https://github.com/modelcontextprotocol/servers)

## License

This list is maintained as part of the 0x7C2f.github.io site. Server entries link to their respective repositories which have their own licenses.

## Contributing

Contributions are welcome! Please read the guidelines above and submit a pull request with your additions.

---

*This feature enables GitHub Pages to serve as an MCP repository list hoster, collecting all MCP servers into a single, accessible API endpoint.*
