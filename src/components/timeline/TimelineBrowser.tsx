"use client";

import { useUrlState } from "@/components/shell/url-state";
import type { TimelineYear } from "@/lib/github";

import { YearRail } from "./YearRail";

/**
 * The timeline with its selected year kept in ?year=, so a year can be shared.
 * Selection happens in the browser, which keeps the page itself static.
 * `years` is newest first and not empty.
 */
export function TimelineBrowser({ years }: { years: TimelineYear[] }) {
    const url = useUrlState();

    // An unknown or absent value means the latest year.
    const requested = url.get("year");
    const latest = years[0];
    const selected = years.find((entry) => String(entry.year) === requested) ?? latest;

    return (
        <YearRail
            years={years}
            selected={selected.year}
            onSelect={(year) => url.set({ year: year === latest.year ? null : String(year) })}
        />
    );
}
