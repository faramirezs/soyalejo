import node from "@astrojs/node";
import react from "@astrojs/react";
import { defineConfig, fontProviders } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import rehypeCallouts from "rehype-callouts";
import emdash, { local } from "emdash/astro";
import { sqlite } from "emdash/db";

export default defineConfig({
	output: "server",
	site: "https://soyalejo.com",
	adapter: node({
		mode: "standalone",
	}),
	server: {
		host: true,
	},
	vite: {
		server: {
			allowedHosts: ["tulik-1", "tulik-1.tailf1b99f.ts.net"],
		},
	},
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
