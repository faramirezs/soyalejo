process.env.ASTRO_NODE_AUTOSTART = "disabled";

import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";

const { handler } = await import("../dist/server/entry.mjs");

let server;
let origin;

before(async () => {
	server = createServer(handler);
	server.listen(0, "127.0.0.1");
	await once(server, "listening");
	const address = server.address();
	assert.ok(address && typeof address === "object");
	origin = `http://127.0.0.1:${address.port}`;
});

after(async () => {
	await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

function fetchPage(path, accept) {
	return fetch(`${origin}${path}`, {
		headers: accept ? { Accept: accept } : undefined,
		redirect: "manual",
	});
}

function plainText(html) {
	return html
		.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
		.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function hasVaryAccept(response) {
	return (response.headers.get("vary") || "")
		.split(",")
		.some((value) => value.trim().toLowerCase() === "accept");
}

test("homepage serves structured HTML with identity metadata", async () => {
	const response = await fetchPage("/");
	const html = await response.text();

	assert.equal(response.status, 200);
	assert.match(response.headers.get("content-type") || "", /^text\/html/);
	assert.ok(hasVaryAccept(response));
	assert.equal((html.match(/<h1\b/gi) || []).length, 1);
	assert.match(html, /<h2[^>]*>Current work<\/h2>/);
	assert.ok(plainText(html).length > 500);
	assert.match(html, /<link rel="canonical" href="https:\/\/soyalejo\.com\/">/);
	assert.match(html, /<meta property="og:type" content="website">/);
	assert.match(html, /<meta property="og:image" content="https:\/\/soyalejo\.com\/images\//);

	const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
		([, value]) => JSON.parse(value),
	);
	const person = schemas.find((schema) => schema["@type"] === "Person");
	assert.deepEqual(person?.name, "Alejandro Ramírez");
	assert.equal(person?.url, "https://soyalejo.com/");
	assert.ok(Array.isArray(person?.sameAs) && person.sameAs.length >= 2);
	assert.equal(person?.contactPoint?.email, "faramirezs@gmail.com");
	assert.deepEqual(person?.address, {
		"@type": "PostalAddress",
		addressLocality: "Berlin",
		addressCountry: "DE",
	});
});

test("homepage negotiates Markdown and honors specific exclusions", async () => {
	const markdown = await fetchPage("/", "text/markdown");
	assert.equal(markdown.status, 200);
	assert.equal(markdown.headers.get("content-type"), "text/markdown; charset=utf-8");
	assert.ok(hasVaryAccept(markdown));
	assert.match(await markdown.text(), /^# Alejandro Ramírez/m);

	const wildcard = await fetchPage("/", "text/html;q=0, */*;q=1");
	assert.equal(wildcard.status, 200);
	assert.equal(wildcard.headers.get("content-type"), "text/markdown; charset=utf-8");
	assert.doesNotMatch(await wildcard.text(), /<!doctype/i);
});

test("HTML documents reject unsupported negotiated representations", async () => {
	const response = await fetchPage("/", "application/json");
	assert.equal(response.status, 406);
	assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8");
	assert.ok(hasVaryAccept(response));
	assert.equal(await response.text(), "Not Acceptable\n");
});

test("missing static and dynamic routes are real 404 responses", async () => {
	const missingHtml = await fetchPage("/not-a-real-page");
	assert.equal(missingHtml.status, 404);
	assert.match(await missingHtml.text(), /Page not found/);

	const missingMarkdown = await fetchPage("/not-a-real-page", "text/markdown");
	assert.equal(missingMarkdown.status, 404);
	assert.equal(missingMarkdown.headers.get("content-type"), "text/markdown; charset=utf-8");
	assert.match(
		await missingMarkdown.text(),
		/\[Home\].*\[Technical tutorials\].*\[About\].*\[Contact\].*\[Agent guide\]/s,
	);

	const missingProject = await fetchPage("/work/not-a-real-case-study");
	assert.equal(missingProject.status, 404);
});

test("trust pages provide substantial HTML and Markdown representations", async () => {
	for (const path of ["/about", "/contact", "/privacy"]) {
		const htmlResponse = await fetchPage(path);
		const html = await htmlResponse.text();
		assert.equal(htmlResponse.status, 200, path);
		assert.ok(hasVaryAccept(htmlResponse), path);
		assert.ok(plainText(html).length > 500, path);

		const markdownResponse = await fetchPage(path, "text/markdown");
		assert.equal(markdownResponse.status, 200, path);
		assert.equal(markdownResponse.headers.get("content-type"), "text/markdown; charset=utf-8", path);
		assert.ok(hasVaryAccept(markdownResponse), path);
		assert.match(await markdownResponse.text(), /^# /m, path);
	}
});

test("work index and a published project provide Markdown", async () => {
	const workResponse = await fetchPage("/work", "text/markdown");
	const workMarkdown = await workResponse.text();
	assert.equal(workResponse.status, 200);
	assert.equal(workResponse.headers.get("content-type"), "text/markdown; charset=utf-8");
	assert.match(workMarkdown, /^# Technical tutorials and case studies/m);

	const projectMatch = workMarkdown.match(/\]\(https:\/\/soyalejo\.com\/work\/([^)]+)\)/);
	assert.ok(projectMatch, "work index exposes a published project URL");
	const projectResponse = await fetchPage(`/work/${projectMatch[1]}`, "text/markdown");
	assert.equal(projectResponse.status, 200);
	assert.equal(projectResponse.headers.get("content-type"), "text/markdown; charset=utf-8");
	assert.match(await projectResponse.text(), /^# .+/m);
});

test("llms.txt is a structured root agent guide", async () => {
	const response = await fetchPage("/llms.txt");
	const body = await response.text();

	assert.equal(response.status, 200);
	assert.match(body, /^# Alejandro Ramírez\n\n> /);
	assert.match(body, /Use this site when/i);
	assert.match(body, /\[Home\]\(https:\/\/soyalejo\.com\/\)/);
	assert.match(body, /\[About\]\(https:\/\/soyalejo\.com\/about\)/);
	assert.match(body, /\[Technical tutorials\]\(https:\/\/soyalejo\.com\/work\)/);
});
