import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ENTRIES_PATH = join(ROOT, "_awesome-pi", "data", "entries.jsonl");
const OUT_DIR = join(ROOT, "assets", "awesome-pi-data");
const BLACKLIST_PATH = join(ROOT, "_awesome-pi", "data", "blacklist.jsonl");

const CATEGORIES = ["extension", "theme", "video", "article", "misc"];
const CATEGORY_META = {
	extension: {
		icon: "🔌",
		title: "Extensions",
		description:
			"Extend Pi's capabilities — custom tools, hooks, integrations, skills, and MCP servers.",
	},
	theme: {
		icon: "🎨",
		title: "Themes",
		description: "Custom themes and color schemes for the Pi TUI.",
	},
	video: {
		icon: "🎬",
		title: "Videos & Tutorials",
		description: "Talks, tutorials, walkthroughs, and demos from the community.",
	},
	article: {
		icon: "📰",
		title: "Articles",
		description: "Blog posts, discussions, and community coverage from around the web.",
	},
	misc: {
		icon: "📦",
		title: "Miscellaneous",
		description:
			"CLIs, dashboards, providers, templates, configurations, and other Pi-related projects.",
	},
};

function decodeHtmlEntities(s) {
	return s
		.replace(/&#39;/g, "'")
		.replace(/&#x27;/g, "'")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"');
}

function displayName(e) {
	if (e.id.startsWith("YT_")) {
		const raw = (e.metadata && e.metadata["title"]) || e.id.replace("YT_", "");
		return decodeHtmlEntities(raw);
	}
	if (e.url && e.url.includes("github.com/")) {
		const match = e.url.match(/github\.com\/[^/]+\/([^/]+)/);
		if (match && match[1]) return match[1];
	}
	return e.name || e.id;
}

function formatNumber(n) {
	if (n >= 1000) {
		const v = n / 1000;
		return v % 1 === 0 ? `${v}k` : `${v.toFixed(1)}k`;
	}
	return String(n);
}

function loadEntries() {
	const raw = readFileSync(ENTRIES_PATH, "utf-8");
	const entries = [];
	const lines = raw.split(/\n/);
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		try {
			entries.push(JSON.parse(trimmed));
		} catch (err) {
			console.warn(`Skipping invalid JSONL line: ${err.message}`);
		}
	}
	return entries;
}

function loadBlacklist() {
	try {
		const raw = readFileSync(BLACKLIST_PATH, "utf-8");
		const entries = [];
		const lines = raw.split(/\n/);
		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;
			try {
				const item = JSON.parse(trimmed);
				entries.push(String(item));
			} catch (err) {
				console.warn(`Skipping invalid blacklist JSONL line: ${err.message}`);
			}
		}
		return new Set(entries);
	} catch {
		return new Set();
	}
}

function main() {
	console.log("Loading entries...");
	const entries = loadEntries();
	const blacklist = loadBlacklist();
	console.log(`Loaded ${entries.length} entries, ${blacklist.size} blacklisted`);

	const filtered = entries.filter((e) => !blacklist.has(String(e.id)));
	console.log(`After blacklist: ${filtered.length} entries`);

	mkdirSync(OUT_DIR, { recursive: true });

	const jsonlPath = join(OUT_DIR, "entries.jsonl");
	const lines = filtered.map((e) => JSON.stringify(e));
	writeFileSync(jsonlPath, lines.join("\n") + "\n", "utf-8");
	console.log(`Wrote entries.jsonl with ${filtered.length} entries`);

	const index = filtered.map((e) => {
		const meta = e.metadata || {};
		let pop = 0;
		let popLabel = "";
		if (typeof meta.views === "number" && meta.views > 0) {
			pop = meta.views;
			popLabel = `📺${formatNumber(pop)}`;
		} else if (typeof meta.stars === "number" && meta.stars > 0) {
			pop = meta.stars;
			popLabel = `⭐${formatNumber(pop)}`;
		} else if (typeof meta.npm_downloads_monthly === "number" && meta.npm_downloads_monthly > 0) {
			pop = meta.npm_downloads_monthly;
			popLabel = `⬇ ${formatNumber(pop)}/mo`;
		}

		return {
			n: displayName(e),
			d: e.description || "",
			c: e.category || "misc",
			u: e.url,
			s: pop,
			p: popLabel,
		};
	});
	writeFileSync(join(OUT_DIR, "search-index.jsonl"), index.map((item) => JSON.stringify(item)).join("\n") + "\n", "utf-8");
	console.log(`Wrote search-index.jsonl with ${index.length} entries`);

	const byCategory = {};
	for (const e of filtered) {
		const cat = e.category || "misc";
		byCategory[cat] = byCategory[cat] || [];
		byCategory[cat].push(e);
	}

	const categories = CATEGORIES.map((slug) => {
		const items = (byCategory[slug] || []).map((e) => ({
			id: e.id,
			name: displayName(e),
			url: e.url,
			description: e.description || "",
			category: e.category,
			metadata: e.metadata,
		}));
		return {
			slug,
			...CATEGORY_META[slug],
			entries: items,
			count: items.length,
		};
	});

	writeFileSync(join(OUT_DIR, "categories.jsonl"), categories.map((cat) => JSON.stringify(cat)).join("\n") + "\n", "utf-8");
	console.log(`Wrote categories.jsonl with ${categories.length} categories`);

	const stats = {
		total: filtered.length,
		byCategory: Object.fromEntries(
			CATEGORIES.map((slug) => [slug, (byCategory[slug] || []).length]),
		),
	};
	writeFileSync(join(OUT_DIR, "stats.json"), JSON.stringify(stats, null, "\t"), "utf-8");
	console.log("Wrote stats.json");
}

main();
