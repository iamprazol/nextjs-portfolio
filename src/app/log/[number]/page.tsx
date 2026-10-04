import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LogEntryDetails } from "@/components/log/LogEntryDetails";
import { LogEntryMeta } from "@/components/log/LogEntryMeta";
import { MonoLabel, Panel } from "@/components/ui";
import { getLog, getLogEntry } from "@/lib/github";

export const revalidate = 3600;

type Props = { params: Promise<{ number: string }> };

// "12" → 12; anything else (including "012" or "1.5") is not an entry.
const parse = (value: string) => (/^[1-9]\d*$/.test(value) ? Number(value) : null);

const numbered = async () =>
    (await getLog()).filter((entry) => entry.number !== null).sort((a, b) => b.number! - a.number!);

// The latest 100 entries are prerendered; older ones render on first request.
export async function generateStaticParams() {
    return (await numbered()).slice(0, 100).map((entry) => ({ number: String(entry.number) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const number = parse((await params).number);
    const entry = number === null ? null : await getLogEntry(number);
    if (!entry) return {};

    return {
        title: `#${entry.number} ${entry.title}`,
        description: entry.summary ?? `${entry.systemName}: ${entry.title}`
    };
}

const neighbour =
    "border-line-2 bg-panel hover:border-acc-line flex min-h-11 flex-1 basis-64 flex-col rounded-xl border p-5 transition-colors";

export default async function LogEntryPage({ params }: Props) {
    const number = parse((await params).number);
    const entry = number === null ? null : await getLogEntry(number);
    if (!entry) notFound();

    // A hidden PR keeps its number but has no page, so neighbours are the
    // nearest listed entries, not simply number ± 1.
    const entries = await numbered();
    const index = entries.findIndex((item) => item.number === entry.number);
    const newer = entries[index - 1];
    const older = entries[index + 1];

    return (
        <div className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6 sm:py-12">
            <Link
                href="/log"
                className="text-ink-2 hover:text-ink -ml-1 inline-flex min-h-11 items-center gap-1.5 font-mono text-sm"
            >
                <ArrowLeft aria-hidden="true" className="size-4" />
                Back to the log
            </Link>

            <article>
                <MonoLabel as="p" className="mt-4">
                    Engineering log #{entry.number}
                    {entry.pinned && " · highlighted"}
                </MonoLabel>
                <h1 className="mt-3 text-3xl leading-tight font-semibold tracking-tight sm:text-[40px]">
                    {entry.title}
                </h1>
                <div className="mt-5">
                    <LogEntryMeta entry={entry} />
                </div>

                <Panel padding="lg" className="mt-8">
                    <LogEntryDetails entry={entry} />
                </Panel>
            </article>

            {(newer || older) && (
                <nav aria-label="More entries" className="mt-8 flex flex-wrap gap-4">
                    {older && (
                        <Link href={`/log/${older.number}`} rel="prev" className={neighbour}>
                            <MonoLabel className="flex items-center gap-1.5">
                                <ArrowLeft aria-hidden="true" className="size-3.5" />
                                Older · #{older.number}
                            </MonoLabel>
                            <span className="mt-2 font-medium">{older.title}</span>
                        </Link>
                    )}
                    {newer && (
                        <Link
                            href={`/log/${newer.number}`}
                            rel="next"
                            className={`${neighbour} sm:items-end sm:text-right`}
                        >
                            <MonoLabel className="flex items-center gap-1.5">
                                Newer · #{newer.number}
                                <ArrowRight aria-hidden="true" className="size-3.5" />
                            </MonoLabel>
                            <span className="mt-2 font-medium">{newer.title}</span>
                        </Link>
                    )}
                </nav>
            )}
        </div>
    );
}
