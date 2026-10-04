"use client";

import { useEffect, useState } from "react";

import { MonoLabel, Panel } from "@/components/ui";

type LocalTimeCardProps = {
    /** Shown in the label, e.g. "Kathmandu". */
    city: string;
    /** IANA time zone of the owner's location. */
    timeZone: string;
};

/**
 * The owner's local time, ticking once a second and paused while the tab is
 * hidden. The page is statically rendered, so a time baked into the HTML would
 * be up to an hour stale; until the browser takes over, a placeholder of the
 * same size is shown instead (no layout shift, no wrong time).
 */
export function LocalTimeCard({ city, timeZone }: LocalTimeCardProps) {
    const [now, setNow] = useState<Date | null>(null);
    const [showSeconds, setShowSeconds] = useState(true);

    useEffect(() => {
        // No per-second tick for people who asked for less motion.
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        setShowSeconds(!reduced);

        let timer: ReturnType<typeof setInterval> | undefined;
        const start = () => {
            setNow(new Date());
            timer = setInterval(() => setNow(new Date()), reduced ? 30_000 : 1000);
        };
        const stop = () => clearInterval(timer);
        const onVisibility = () => {
            stop();
            if (!document.hidden) start();
        };

        start();
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            stop();
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, []);

    const time = now
        ? new Intl.DateTimeFormat("en-GB", {
              timeZone,
              hour: "2-digit",
              minute: "2-digit",
              second: showSeconds ? "2-digit" : undefined,
              hour12: false
          }).format(now)
        : "--:--:--";
    const date = now
        ? new Intl.DateTimeFormat("en-GB", {
              timeZone,
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric"
          }).format(now)
        : " ";
    const zone = now
        ? new Intl.DateTimeFormat("en-GB", { timeZone, timeZoneName: "shortOffset" })
              .formatToParts(now)
              .find((part) => part.type === "timeZoneName")?.value
        : undefined;

    return (
        <Panel>
            <MonoLabel as="h2">Local time · {city}</MonoLabel>
            <p className="mt-3 font-mono text-3xl font-medium tabular-nums">
                <time dateTime={now?.toISOString()}>{time}</time>
            </p>
            <p className="text-ink-2 mt-1 text-sm">{date}</p>
            {/* Always rendered so the card keeps its height before the clock starts. */}
            <p className="text-mute mt-0.5 font-mono text-xs">{zone ?? "\u00a0"}</p>
        </Panel>
    );
}
