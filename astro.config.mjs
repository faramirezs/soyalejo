import node from "@astrojs/node";
import react from "@astrojs/react";
import { defineConfig, fontProviders } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import rehypeCallouts from "rehype-callouts";
import emdash, { local } from "emdash/astro";
import { sqlite } from "emdash/db";

export default defineConfig({
	output: "server",
	adapter: node({
		mode: "standalone",
	}),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			database: sqlite({ url: "file:./data.db" }),
			storage: local({
				directory: "./uploads",
				baseUrl: "/_emdash/api/media/file",
			}),
		}),
	],
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Google Sans Code",
			cssVariable: "--font-app",
			weights: [300, 400, 500, 600, 700],
			styles: ["normal", "italic"],
			formats: ["woff", "ttf"],
			fallbacks: ["monospace"],
		},
	],
	markdown: {
		processor: unified({
			rehypePlugins: [rehypeCallouts],
		}),
	},
	devToolbar: { enabled: false },
});
