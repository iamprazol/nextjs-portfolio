import type { Metadata } from "next";
import Link from "next/link";

import { PrintButton } from "@/components/resume/PrintButton";
import { MonoLabel, statusLabel } from "@/components/ui";
import { formatCount, formatDate } from "@/lib/format";
import { getLog, getProfile, getStats, getSystems, getTimeline } from "@/lib/github";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
    const profile = await getProfile();
    return pageMetadata({
        title: "Résumé",
        description: `Résumé of ${profile.name}, generated from the same GitHub data as the rest of the site.`,
        path: "/resume"
    });
}

const HIGHLIGHTS = 5;

// "https://github.com/demo-dev" → "github.com/demo-dev": readable on paper.
const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    const id = `resume-${title.toLowerCase().replace(/\s+/g, "-")}`;
    return (
        <section aria-labelledby={id} className="mt-8 print:mt-5">
            <MonoLabel as="h2" id={id} className="border-line block border-b pb-2">
                {title}
            </MonoLabel>
            <div className="mt-4 print:mt-3">{children}</div>
        </section>
    );
}

// Nothing here is written for the résumé: it is the profile, systems, timeline
// and highlighted log entries the other pages show, laid out for one sheet.
export default async function ResumePage() {
    const [profile, stats, systems, timeline, log] = await Promise.all([
        getProfile(),
        getStats(),
        getSystems(),
        getTimeline(),
        getLog()
    ]);

    const { links } = profile;
    const contact = [
        ...(links.email ? [{ text: links.email, href: `mailto:${links.email}` }] : []),
        { text: bare(links.github), href: links.github },
        ...(links.linkedin ? [{ text: bare(links.linkedin), href: links.linkedin }] : []),
        ...(links.website ? [{ text: bare(links.website), href: links.website }] : [])
    ];

    // A stat with no value is left out, not shown as zero.
    const facts = [
        stats.yearsOfEngineering ? `${stats.yearsOfEngineering} years of production engineering` : null,
        stats.products ? `${stats.products} ${stats.products === 1 ? "system" : "systems"} built or maintained` : null,
        stats.developersLed ? `${stats.developersLed} developers led` : null,
        stats.prsMerged ? `${formatCount(stats.prsMerged)} pull requests merged` : null
    ].filter((fact): fact is string => fact !== null);

    // Entries labelled portfolio:highlight, which getLog() lists first.
    const highlights = log.filter((entry) => entry.pinned).slice(0, HIGHLIGHTS);

    return (
        <div className="mx-auto max-w-[860px] px-4 py-10 sm:px-6 sm:py-14 print:max-w-none print:p-0">
            <div className="mb-6 flex justify-end print:hidden">
                <PrintButton />
            </div>

            <article className="border-line-2 bg-panel shadow-card rounded-xl border p-6 text-[15px] leading-relaxed sm:p-10 print:rounded-none print:border-0 print:p-0 print:text-[10.5pt] print:leading-snug print:shadow-none">
                <header>
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl print:text-[22pt]">
                        {profile.name}
                    </h1>
                    {profile.headline && (
                        <p className="text-ink-2 mt-1 font-mono text-base print:text-[11pt]">
                            {profile.headline}
                        </p>
                    )}
                    <ul className="text-ink-2 mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-sm print:text-[9pt]">
                        {profile.location && <li>{profile.location.label}</li>}
                        {contact.map((item) => (
                            <li key={item.href}>
                                <a href={item.href} className="hover:text-link break-all hover:underline">
                                    {item.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                    {profile.intro && <p className="mt-5 max-w-[70ch] print:mt-3">{profile.intro}</p>}
                    {facts.length > 0 && (
                        <ul className="text-ink-2 mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm print:mt-2 print:text-[9.5pt]">
                            {facts.map((fact) => (
                                <li key={fact}>{fact}</li>
                            ))}
                        </ul>
                    )}
                </header>

                {systems.length > 0 && (
                    <Section title="Systems">
                        <ul className="space-y-5 print:space-y-3">
                            {systems.map((system) => (
                                <li key={system.slug} className="break-inside-avoid">
                                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                                        <h3 className="font-semibold">
                                            <Link href={`/systems/${system.slug}`} className="hover:text-link hover:underline">
                                                {system.name}
                                            </Link>
                                            {system.kind && (
                                                <span className="text-ink-2 font-normal"> — {system.kind}</span>
                                            )}
                                        </h3>
                                        <p className="text-mute font-mono text-xs print:text-[8.5pt]">
                                            {statusLabel[system.status]}
                                        </p>
                                    </div>
                                    {system.role.length > 0 && (
                                        <p className="text-ink-2 text-sm print:text-[9.5pt]">
                                            {system.role.join(" · ")}
                                        </p>
                                    )}
                                    {(system.proves ?? system.description) && (
                                        <p className="mt-1">{system.proves ?? system.description}</p>
                                    )}
                                    {system.stack.length > 0 && (
                                        <p className="text-mute mt-1 font-mono text-xs print:text-[8.5pt]">
                                            {system.stack.join(" · ")}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}

                {highlights.length > 0 && (
                    <Section title="Highlights">
                        <ul className="space-y-2 print:space-y-1">
                            {highlights.map((entry) => (
                                <li key={entry.id} className="break-inside-avoid">
                                    <span className="font-medium">
                                        {entry.number !== null ? (
                                            <Link href={`/log/${entry.number}`} className="hover:text-link hover:underline">
                                                {entry.title}
                                            </Link>
                                        ) : (
                                            entry.title
                                        )}
                                    </span>
                                    <span className="text-ink-2">
                                        {" — "}
                                        {entry.systemName}, {formatDate(entry.date)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}

                {timeline.length > 0 && (
                    <Section title="Timeline">
                        <ol className="space-y-3 print:space-y-2">
                            {timeline.map((year) => (
                                <li key={year.year} className="flex break-inside-avoid gap-4">
                                    <span className="text-link w-12 shrink-0 font-mono print:w-10">{year.year}</span>
                                    <div className="min-w-0">
                                        {year.title && <p className="font-medium">{year.title}</p>}
                                        {year.summary && <p className="text-ink-2">{year.summary}</p>}
                                        <p className="text-mute font-mono text-xs print:text-[8.5pt]">
                                            {[
                                                `${formatCount(year.commits)} commits`,
                                                `${formatCount(year.pullRequests)} PRs`,
                                                `${formatCount(year.reviews)} reviews`,
                                                ...(year.notableRelease
                                                    ? [`shipped ${year.notableRelease.systemName} ${year.notableRelease.tag}`]
                                                    : []),
                                                ...year.topLanguages
                                            ].join(" · ")}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </Section>
                )}
            </article>
        </div>
    );
}
