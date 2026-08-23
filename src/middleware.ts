import { defineMiddleware } from "astro:middleware";

const PRODUCES = ["text/html", "text/markdown"] as const;

type Representation = (typeof PRODUCES)[number];
type AcceptEntry = {
	type: string;
	quality: number;
	specificity: number;
	position: number;
};

function parseAccept(header: string): AcceptEntry[] {
	return header.split(",").map((raw, position) => {
		const [mediaRange = "", ...parameters] = raw.trim().split(";");
		let quality = 1;

		for (const parameter of parameters) {
			const [name, value] = parameter.trim().split("=");
			if (name?.toLowerCase() !== "q") continue;
			const parsed = Number(value);
			if (!Number.isNaN(parsed)) quality = Math.max(0, Math.min(1, parsed));
		}

		const type = mediaRange.toLowerCase();
		return {
			type,
			quality,
			specificity: type === "*/*" ? 0 : type.endsWith("/*") ? 1 : 2,
			position,
		};
	});
}


export function preferredRepresentation(header: string | null): Representation | null {
	if (!header) return "text/html";
	const entries = parseAccept(header);
	if (entries.length === 0) return "text/html";

	let selected: Representation | null = null;
	let selectedQuality = -1;
	let selectedPosition = Number.POSITIVE_INFINITY;

	for (const representation of PRODUCES) {
		const match = entries
			.filter(
				(entry) =>
					entry.type === "*/*" ||
					(entry.type.endsWith("/*") &&
						representation.startsWith(entry.type.slice(0, -1))) ||
					entry.type === representation,
			)
			.sort(
				(left, right) =>
					right.specificity - left.specificity || left.position - right.position,
			)[0];

		if (!match || match.quality === 0) continue;
		if (
			match.quality > selectedQuality ||
			(match.quality === selectedQuality && match.position < selectedPosition)
		) {
			selected = representation;
			selectedQuality = match.quality;
			selectedPosition = match.position;
		}
	}

	return selected;
}

function appendVaryAccept(headers: Headers): void {
	const existing = headers.get("Vary");
	if (!existing) {
		headers.set("Vary", "Accept");
		return;
	}

	if (!existing.split(",").some((value) => value.trim().toLowerCase() === "accept")) {
		headers.set("Vary", `${existing}, Accept`);
	}
}

export const onRequest = defineMiddleware(async (context, next) => {
	const preferred = preferredRepresentation(context.request.headers.get("accept"));
	context.locals.prefersMarkdown = preferred === "text/markdown";

	const response = await next();
	const contentType = response.headers.get("Content-Type") || "";
	if (!contentType.startsWith("text/html") && !contentType.startsWith("text/markdown")) {
		return response;
	}

	if (!preferred) {
		return new Response("Not Acceptable\n", {
			status: 406,
			headers: { Vary: "Accept", "Content-Type": "text/plain; charset=utf-8" },
		});
	}

	appendVaryAccept(response.headers);
	return response;
});
