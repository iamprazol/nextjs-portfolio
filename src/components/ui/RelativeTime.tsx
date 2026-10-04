"use client";

import { useEffect, useState } from "react";

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3600],
    ["minute", 60]
];

function relative(iso: string, now: number) {
    const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
    const format = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "short" });

    for (const [unit, size] of UNITS) {
        if (Math.abs(seconds) >= size) return format.format(Math.trunc(seconds / size), unit);
    }
    return "just now";
}

const absolute = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
});

/**
 * "3 hr. ago". Pages are statically rendered, so the server prints the date
 * itself (which cannot go stale) and the browser swaps in the relative form.
 */
export function RelativeTime({ iso, className }: { iso: string; className?: string }) {
    const [text, setText] = useState<string | null>(null);

    useEffect(() => {
        const update = () => setText(relative(iso, Date.now()));
        update();
        const timer = setInterval(update, 60_000);
        return () => clearInterval(timer);
    }, [iso]);

    const date = absolute.format(new Date(iso));
    return (
        <time dateTime={iso} title={date} className={className}>
            {text ?? date}
        </time>
    );
}
