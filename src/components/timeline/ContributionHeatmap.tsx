import { cn } from "@/lib/cn";
import { formatCount } from "@/lib/format";

// Level 0 is an empty day; 1–4 are opacity steps of the accent.
const levelClass = ["bg-chip", "bg-acc/25", "bg-acc/50", "bg-acc/75", "bg-acc"];

type ContributionHeatmapProps = {
    year: number;
    /** Weeks (Sunday first) of seven levels; null is a day outside the year or not reached yet. */
    weeks: (number | null)[][];
    total: number;
    inProgress: boolean;
};

/** The year's contribution calendar as one strip: a column per week, a row per weekday. */
export function ContributionHeatmap({ year, weeks, total, inProgress }: ContributionHeatmapProps) {
    return (
        <figure>
            <div
                role="img"
                aria-label={`Contribution calendar for ${year}: ${formatCount(total)} ${total === 1 ? "contribution" : "contributions"}${inProgress ? " so far" : ""}.`}
                className="grid grid-flow-col grid-rows-7 gap-px sm:gap-[3px]"
                style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
            >
                {weeks.flatMap((week, column) =>
                    week.map((level, row) => (
                        <span
                            key={`${column}-${row}`}
                            className={cn(
                                "aspect-square rounded-[1px] sm:rounded-[3px]",
                                level !== null && levelClass[level]
                            )}
                        />
                    ))
                )}
            </div>
            <figcaption className="text-mute mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 font-mono text-xs">
                <span>
                    {formatCount(total)} {total === 1 ? "contribution" : "contributions"}
                    {inProgress && " so far"}
                </span>
                <span aria-hidden="true" className="flex items-center gap-1.5">
                    Less
                    {levelClass.map((level) => (
                        <span key={level} className={cn("size-2.5 rounded-[2px]", level)} />
                    ))}
                    More
                </span>
            </figcaption>
        </figure>
    );
}
