---
title: Can You Run MCP Servers on GitHub Pages?
layout: post
permalink: /mcp-servers-github-pages/
---

# Can You Run MCP Servers on GitHub Pages?

If you're exploring the Model Context Protocol (MCP) and wondering whether you can host an MCP server on GitHub Pages, this post will clarify the technical constraints and provide alternative solutions.

## The Short Answer

**No, you cannot run MCP servers (TypeScript/Node.js or Python variants) directly on GitHub Pages.**

GitHub Pages is a static site hosting service. It serves HTML, CSS, JavaScript, and other static assets but does not provide a runtime environment for server-side code execution.

## Why MCP Servers Won't Work on GitHub Pages

### 1. **GitHub Pages Only Serves Static Content**

GitHub Pages is designed to host static websites built with tools like Jekyll, Hugo, or plain HTML/CSS/JS. It doesn't support:
- Running Node.js processes
- Executing Python scripts
- Maintaining persistent server connections
- WebSocket connections (required for MCP)

### 2. **MCP Servers Require Active Runtime**

MCP servers need to:
- Run continuously to accept and respond to requests
- Maintain stateful connections
- Execute server-side code dynamically
- Use STDIO or HTTP transport protocols

These requirements are fundamentally incompatible with static hosting.

## Alternative Solutions

While you can't run the server on GitHub Pages, you have several options:

### Option 1: Host Your Server Elsewhere

You can host your MCP server on platforms that support server-side execution and use GitHub Pages for documentation:

**Recommended Hosting Platforms:**

1. **Cloud Platforms**
   - AWS (EC2, Lambda)
   - Google Cloud Platform (Compute Engine, Cloud Functions)
   - Azure (Virtual Machines, Azure Functions)
   - DigitalOcean Droplets

2. **Platform-as-a-Service (PaaS)**
   - Heroku
   - Railway.app
   - Render.com
   - Fly.io

3. **Serverless Options**
   - Vercel (for Next.js-based implementations)
   - Netlify Functions
   - AWS Lambda

### Option 2: Use GitHub Pages for Documentation Only

You can use your GitHub Pages site to:
- Document your MCP server implementation
- Provide setup instructions
- Share API documentation
- Link to your hosted server
- Tutorial guides for users

### Option 3: Local Development

For personal use or development:
- Run the MCP server locally on your machine
- Connect it to Claude for Desktop or other MCP clients
- Use GitHub Pages to share your code and documentation

## Example: TypeScript MCP Server Setup

Here's how you would set up a TypeScript MCP server (for local use or remote hosting):

### Prerequisites

```bash
# Verify Node.js installation
node --version  # Should be 16 or higher
npm --version
```

### Project Setup

```bash
# Create project directory
mkdir weather-mcp-server
cd weather-mcp-server

# Initialize npm project
npm init -y

# Install dependencies
npm install @modelcontextprotocol/sdk zod@3
npm install -D @types/node typescript
```

### TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Update package.json

```json
{
  "type": "module",
  "bin": {
    "weather": "./build/index.js"
  },
  "scripts": {
    "build": "tsc && chmod 755 build/index.js"
  },
  "files": ["build"]
}
```

### Server Implementation

Create `src/index.ts`:

```typescript
#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";

// Create server instance
const server = new McpServer({
  name: "weather",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Helper function for API requests
async function makeNWSRequest<T>(url: string): Promise<T | null> {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "application/geo+json",
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making NWS request:", error);
    return null;
  }
}

// Type definitions
interface AlertFeature {
  properties: {
    event?: string;
    areaDesc?: string;
    severity?: string;
    status?: string;
    headline?: string;
  };
}

interface AlertsResponse {
  features: AlertFeature[];
}

interface PointsResponse {
  properties: {
    forecast?: string;
  };
}

interface ForecastPeriod {
  name?: string;
  temperature?: number;
  temperatureUnit?: string;
  windSpeed?: string;
  windDirection?: string;
  shortForecast?: string;
  detailedForecast?: string;
}

interface ForecastResponse {
  properties: {
    periods: ForecastPeriod[];
  };
}

// Format alert data
function formatAlert(feature: AlertFeature): string {
  const props = feature.properties;
  return [
    `Event: ${props.event || "Unknown"}`,
    `Area: ${props.areaDesc || "Unknown"}`,
    `Severity: ${props.severity || "Unknown"}`,
    `Status: ${props.status || "Unknown"}`,
    `Headline: ${props.headline || "No headline"}`,
    "---",
  ].join("\n");
}

// Register get_alerts tool
server.tool(
  "get_alerts",
  "Get weather alerts for a state",
  {
    state: z.string().length(2).describe("Two-letter state code (e.g. CA, NY)"),
  },
  async ({ state }) => {
    const stateCode = state.toUpperCase();
    const alertsUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
    const alertsData = await makeNWSRequest<AlertsResponse>(alertsUrl);

    if (!alertsData) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve alerts data",
          },
        ],
      };
    }

    const features = alertsData.features || [];
    if (features.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No active alerts for ${stateCode}`,
          },
        ],
      };
    }

    const formattedAlerts = features.map(formatAlert);
    const alertsText = `Active alerts for ${stateCode}:\n\n${formattedAlerts.join("\n")}`;

    return {
      content: [
        {
          type: "text",
          text: alertsText,
        },
      ],
    };
  },
);

// Register get_forecast tool
server.tool(
  "get_forecast",
  "Get weather forecast for a location",
  {
    latitude: z.number().min(-90).max(90).describe("Latitude of the location"),
    longitude: z.number().min(-180).max(180).describe("Longitude of the location"),
  },
  async ({ latitude, longitude }) => {
    // Get the forecast grid endpoint
    const pointsUrl = `${NWS_API_BASE}/points/${latitude},${longitude}`;
    const pointsData = await makeNWSRequest<PointsResponse>(pointsUrl);

    if (!pointsData || !pointsData.properties.forecast) {
      return {
        content: [
          {
            type: "text",
            text: "Unable to fetch forecast data for this location.",
          },
        ],
      };
    }

    // Get the forecast
    const forecastUrl = pointsData.properties.forecast;
    const forecastData = await makeNWSRequest<ForecastResponse>(forecastUrl);

    if (!forecastData) {
      return {
        content: [
          {
            type: "text",
            text: "Unable to fetch detailed forecast.",
          },
        ],
      };
    }

    // Format the forecast
    const periods = forecastData.properties.periods;
    const forecasts = periods.slice(0, 5).map((period) => {
      return [
        `${period.name}:`,
        `Temperature: ${period.temperature}°${period.temperatureUnit}`,
        `Wind: ${period.windSpeed} ${period.windDirection}`,
        `Forecast: ${period.detailedForecast}`,
      ].join("\n");
    });

    return {
      content: [
        {
          type: "text",
          text: forecasts.join("\n---\n"),
        },
      ],
    };
  },
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

### Building and Running

```bash
# Build the TypeScript code
npm run build

# Run the server (for testing)
node build/index.js
```

## Connecting to Claude for Desktop

To use your locally-running MCP server with Claude for Desktop:

1. Edit your Claude configuration file:

**macOS/Linux:**
```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
code $env:AppData\Claude\claude_desktop_config.json
```

2. Add your server configuration:

**macOS/Linux:**
```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": [
        "/absolute/path/to/weather-mcp-server/build/index.js"
      ]
    }
  }
}
```

**Windows:**
```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": [
        "C:\\absolute\\path\\to\\weather-mcp-server\\build\\index.js"
      ]
    }
  }
}
```

3. Restart Claude for Desktop

## Important Considerations

### STDIO vs HTTP Transport

- **STDIO:** Best for local development and direct integration with Claude for Desktop
- **HTTP:** Better for remote hosting and web-based clients

### Security

When hosting MCP servers remotely:
- Implement authentication
- Use HTTPS
- Rate limit requests
- Validate all inputs
- Monitor for abuse

### Logging Best Practices

For STDIO-based servers:
```typescript
// ❌ Bad - corrupts JSON-RPC
console.log("Server started");

// ✅ Good - writes to stderr
console.error("Server started");
```

For HTTP-based servers, standard output logging is fine.

## Conclusion

While you **cannot run MCP servers directly on GitHub Pages**, you have multiple alternatives:

1. **Host the server on a cloud platform** and use GitHub Pages for documentation
2. **Run the server locally** for personal use with Claude for Desktop
3. **Use serverless functions** for lightweight implementations

GitHub Pages remains an excellent choice for:
- Documenting your MCP server
- Sharing setup instructions
- Hosting static API documentation
- Providing tutorials and guides

The TypeScript variant of MCP servers works excellently when properly hosted—just not on static hosting platforms like GitHub Pages.

## Resources

- [MCP Official Documentation](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude for Desktop](https://claude.ai/download)
- [Example MCP Servers](https://github.com/modelcontextprotocol/servers)

---

*Have questions about MCP servers or need help with setup? Feel free to reach out!*
