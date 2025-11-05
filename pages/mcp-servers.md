---
title: MCP Server Repository List
layout: post
permalink: /mcp-servers/
---

# MCP Server Repository List

A curated collection of Model Context Protocol (MCP) servers. This list is also available as a [JSON API endpoint](/api/mcp-servers.json) for programmatic access.

## What is MCP?

The Model Context Protocol (MCP) is an open protocol that enables seamless integration between LLM applications and external data sources and tools. For more information about MCP and hosting considerations, see our [guide on MCP servers and GitHub Pages](/mcp-servers-github-pages/).

## Available Servers

<div class="mcp-server-list">
{% for server in site.data.mcp_servers.servers %}
<div class="mcp-server" id="{{ server.name | slugify }}">
  <h3>{{ server.name }}</h3>
  <p>{{ server.description }}</p>
  
  <p><strong>Language:</strong> {{ server.language }}</p>
  
  <p><strong>Repository:</strong> <a href="{{ server.repository }}" target="_blank">{{ server.repository }}</a></p>
  
  {% if server.features %}
  <p><strong>Features:</strong></p>
  <ul>
    {% for feature in server.features %}
    <li>{{ feature }}</li>
    {% endfor %}
  </ul>
  {% endif %}
  
  {% if server.tags %}
  <p><strong>Tags:</strong> {{ server.tags | join: ", " }}</p>
  {% endif %}
</div>
{% endfor %}
</div>

## API Access

You can access this list programmatically via our JSON API:

```bash
curl https://0x7c2f.github.io/api/mcp-servers.json
```

The API returns a JSON object with all MCP server entries, including:
- Server name and description
- Repository URL
- Programming language
- Features list
- Tags for categorization

## Contributing

Want to add your MCP server to this list? The data is maintained in `_data/mcp_servers.yml`. You can:

1. Fork this repository
2. Add your server to `_data/mcp_servers.yml` following the existing format:

```yaml
- name: "Your Server Name"
  description: "Brief description of what your server does"
  repository: "https://github.com/username/repo"
  language: "TypeScript" # or Python, etc.
  features:
    - "Feature 1"
    - "Feature 2"
  tags:
    - "category1"
    - "category2"
```

3. Submit a pull request

## Search by Language

{% assign languages = site.data.mcp_servers.servers | map: "language" | uniq | sort %}

{% for language in languages %}
- **{{ language }}**: 
  {% assign lang_servers = site.data.mcp_servers.servers | where: "language", language %}
  {% for server in lang_servers %}[{{ server.name }}](#{{ server.name | slugify }}){% unless forloop.last %}, {% endunless %}{% endfor %}
{% endfor %}

## Search by Tag

{% assign all_tags = "" | split: "" %}
{% for server in site.data.mcp_servers.servers %}
  {% for tag in server.tags %}
    {% assign all_tags = all_tags | push: tag %}
  {% endfor %}
{% endfor %}
{% assign unique_tags = all_tags | uniq | sort %}

{% for tag in unique_tags %}
- **{{ tag }}**: 
  {% assign tagged_servers = "" | split: "" %}
  {% for server in site.data.mcp_servers.servers %}
    {% if server.tags contains tag %}
      {% assign tagged_servers = tagged_servers | push: server %}
    {% endif %}
  {% endfor %}
  {% for server in tagged_servers %}[{{ server.name }}](#{{ server.name | slugify }}){% unless forloop.last %}, {% endunless %}{% endfor %}
{% endfor %}

---

*Last updated: {{ site.time | date: "%Y-%m-%d" }}*
