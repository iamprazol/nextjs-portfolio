import { env } from "@/env";
import { getLog, getProfile } from "@/lib/github";

export const revalidate = 3600;

const escape = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

/** RSS 2.0 feed of the 50 newest log entries. */
export async function GET() {
    const [log, profile] = await Promise.all([getLog(), getProfile()]);
    // getLog() lists pinned entries first; a feed is strictly newest first.
    const entries = [...log].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50);
    const site = env.SITE_URL;

    const items = entries.map((entry) => {
        // PRs have a page here; releases link to GitHub, or to the log when private.
        const link =
            entry.number !== null ? `${site}/log/${entry.number}` : (entry.url ?? `${site}/log`);
        const title = entry.number !== null ? `#${entry.number} ${entry.title}` : entry.title;

        return [
            "    <item>",
            `      <title>${escape(title)}</title>`,
            `      <link>${escape(link)}</link>`,
            `      <guid isPermaLink="false">${escape(entry.id)}</guid>`,
            `      <pubDate>${new Date(entry.date).toUTCString()}</pubDate>`,
            `      <category>${escape(entry.systemName)}</category>`,
            ...(entry.summary ? [`      <description>${escape(entry.summary)}</description>`] : []),
            "    </item>"
        ].join("\n");
    });

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        "  <channel>",
        `    <title>${escape(`${profile.name} — Engineering Log`)}</title>`,
        `    <link>${site}/log</link>`,
        "    <description>Merged pull requests and releases, newest first.</description>",
        "    <language>en</language>",
        `    <atom:link href="${site}/log/rss.xml" rel="self" type="application/rss+xml" />`,
        ...(entries[0] ? [`    <lastBuildDate>${new Date(entries[0].date).toUTCString()}</lastBuildDate>`] : []),
        ...items,
        "  </channel>",
        "</rss>",
        ""
    ].join("\n");

    return new Response(xml, {
        headers: { "Content-Type": "application/rss+xml; charset=utf-8" }
    });
}
