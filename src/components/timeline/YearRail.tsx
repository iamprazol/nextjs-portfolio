import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";
import type { TimelineYear } from "@/lib/github";

const countFormat = new Intl.NumberFormat("en-US");

type YearRailProps = {
    years: TimelineYear[];
    selected: number;
    onSelect?: (year: number) => void;
};

/**
 * The years as a rail of dots joined by a line: down the side on wide screens,
 * a scrolling row on narrow ones. Finished years have a filled dot, the year
 * in progress a hollow one, and the selected year is ringed.
 */
export function YearRail({ years, selected, onSelect }: YearRailProps) {
    const list = useRef<HTMLOListElement>(null);
    const selectedItem = useRef<HTMLLIElement>(null);

    // On narrow screens the rail scrolls sideways: keep the selected year in
    // view. Only the rail moves, never the page.
    useEffect(() => {
        const rail = list.current;
        const item = selectedItem.current;
        if (!rail || !item || rail.scrollWidth <= rail.clientWidth) return;
        rail.scrollTo({ left: item.offsetLeft - (rail.clientWidth - item.offsetWidth) / 2 });
    }, [selected]);

    return (
        <ol
            ref={list}
            aria-label="Years"
            className="relative flex overflow-x-auto pt-1 pb-4 lg:block lg:overflow-visible lg:py-0"
        >
            {years.map((entry, index) => {
                const current = entry.year === selected;
                return (
                    <li
                        key={entry.year}
                        ref={current ? selectedItem : undefined}
                        className="relative w-44 shrink-0 pt-7 lg:w-auto lg:pt-0 lg:pl-9"
                    >
                        {/* The line stops at the first and last dot. */}
                        <span
                            aria-hidden="true"
                            className={cn(
                                "bg-line-2 absolute top-[9px] right-0 left-0 h-px lg:top-0 lg:right-auto lg:bottom-0 lg:left-[9px] lg:h-auto lg:w-px",
                                index === 0 && "left-5 lg:top-7 lg:left-[9px]",
                                index === years.length - 1 && "right-auto w-5 lg:bottom-auto lg:h-7 lg:w-px"
                            )}
                        />
                        <span
                            aria-hidden="true"
                            className={cn(
                                "border-acc ring-offset-bg absolute top-0.5 left-3 size-[15px] rounded-full border-2 ring-offset-2 lg:top-5 lg:left-0.5",
                                entry.inProgress ? "bg-bg" : "bg-acc",
                                current && "ring-acc ring-2"
                            )}
                        />
                        <button
                            type="button"
                            aria-current={current ? "true" : undefined}
                            onClick={() => onSelect?.(entry.year)}
                            className={cn(
                                "min-h-11 w-full cursor-pointer rounded-lg border px-3 py-3 text-left transition-colors focus-visible:-outline-offset-2",
                                current
                                    ? "border-line-2 bg-panel shadow-card"
                                    : "hover:bg-panel-2 border-transparent"
                            )}
                        >
                            <span
                                className={cn(
                                    "block font-mono text-sm",
                                    current ? "text-link" : "text-mute"
                                )}
                            >
                                {entry.year}
                            </span>
                            {entry.title && (
                                <span className="text-ink mt-1 block truncate font-semibold">
                                    {entry.title}
                                </span>
                            )}
                            <span className="text-ink-2 mt-0.5 block truncate text-sm">
                                {entry.summary ??
                                    `${countFormat.format(entry.totalContributions)} ${entry.totalContributions === 1 ? "contribution" : "contributions"}`}
                            </span>
                        </button>
                    </li>
                );
            })}
        </ol>
    );
}
