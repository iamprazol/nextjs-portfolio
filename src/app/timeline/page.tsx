import type { Metadata } from "next";
import { Suspense } from "react";

import { StaticUrlState, UrlStateProvider } from "@/components/shell/url-state";
import { TimelineBrowser } from "@/components/timeline/TimelineBrowser";
import { getTimeline } from "@/lib/github";

export const revalidate = 3600;

export const metadata: Metadata = {
    title: "Engineering Timeline",
    description: "Year by year: what was built, in which languages, and how much — counted from GitHub."
};

export default async function TimelinePage() {
    // Newest first; years without contributions are already left out.
    const years = await getTimeline();
    const content = <TimelineBrowser years={years} />;

    return (
        <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Engineering Timeline</h1>
            <p className="text-ink-2 mt-3 font-mono text-sm sm:text-base">
                Key moments, learnings and growth.
            </p>

            {years.length === 0 ? (
                <p className="text-ink-2 border-line mt-10 border-t pt-8">
                    No contributions to show yet.
                </p>
            ) : (
                <div className="mt-10 lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
                    {/* See url-state.tsx: the fallback is the same content without the query string. */}
                    <Suspense fallback={<StaticUrlState>{content}</StaticUrlState>}>
                        <UrlStateProvider>{content}</UrlStateProvider>
                    </Suspense>
                </div>
            )}
        </div>
    );
}
