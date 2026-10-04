import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LogList } from "@/components/log/LogList";
import { Pagination } from "@/components/log/Pagination";
import { getLog } from "@/lib/github";

const PAGE_SIZE = 20;

export const metadata: Metadata = {
    title: "Engineering Log",
    description: "Merged pull requests and releases, newest first. Nothing here is typed by hand."
};

type Props = { searchParams: Promise<{ page?: string }> };

// Reads the query string, so this page renders per request. The data behind it
// is still cached for an hour by the data layer.
export default async function LogPage({ searchParams }: Props) {
    const params = await searchParams;
    const entries = await getLog();

    const pages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
    const page = params.page === undefined ? 1 : Number(params.page);
    if (!Number.isInteger(page) || page < 1 || page > pages) notFound();

    const visible = entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="mx-auto max-w-[1040px] px-4 py-12 sm:px-6 sm:py-16">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Engineering Log</h1>
            <p className="text-ink-2 mt-3 font-mono text-sm sm:text-base">
                Small changes. Big impact.
            </p>

            {entries.length === 0 ? (
                <p className="text-ink-2 border-line mt-10 border-t pt-8">
                    No log entries yet. They appear when pull requests are merged in a system
                    repository.
                </p>
            ) : (
                <div className="mt-10">
                    <LogList entries={visible} />
                    <Pagination
                        page={page}
                        pages={pages}
                        href={(target) => (target === 1 ? "/log" : `/log?page=${target}`)}
                    />
                </div>
            )}
        </div>
    );
}
