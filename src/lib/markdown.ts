type PortableTextChild = {
	text?: unknown;
};

type PortableTextBlock = {
	_type?: unknown;
	style?: unknown;
	listItem?: unknown;
	level?: unknown;
	children?: unknown;
};

export function markdownResponse(markdown: string, status = 200): Response {
	return new Response(markdown, {
		status,
		headers: {
			"Content-Type": "text/markdown; charset=utf-8",
			Vary: "Accept",
		},
	});
}

export function portableTextToMarkdown(value: unknown): string {
	if (!Array.isArray(value)) return "";

	const blocks: string[] = [];
	for (const valueBlock of value) {
		if (!valueBlock || typeof valueBlock !== "object") continue;
		const block = valueBlock as PortableTextBlock;
		if (block._type !== "block" || !Array.isArray(block.children)) continue;

		const text = block.children
			.map((child) => {
				if (!child || typeof child !== "object") return "";
				const { text } = child as PortableTextChild;
				return typeof text === "string" ? text : "";
			})
			.join("")
			.trim();
		if (!text) continue;

		const style = typeof block.style === "string" ? block.style : "normal";
		if (/^h[1-6]$/.test(style)) {
			blocks.push(`${"#".repeat(Number(style.slice(1)))} ${text}`);
			continue;
		}
		if (style === "blockquote") {
			blocks.push(`> ${text}`);
			continue;
		}
		if (typeof block.listItem === "string") {
			const level = typeof block.level === "number" ? block.level : 1;
			const prefix = block.listItem === "number" ? "1." : "-";
			blocks.push(`${"  ".repeat(Math.max(0, level - 1))}${prefix} ${text}`);
			continue;
		}

		blocks.push(text);
	}

	return blocks.join("\n\n");
}
