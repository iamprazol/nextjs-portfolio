import { ArrowUpRight, FileText } from "lucide-react";

import { Button } from "@/components/ui";
import type { ProfileData, Stats } from "@/lib/github";

type Stat = { value: number; label: string; detail: string };

/**
 * Up to three stats. One with no value is left out, not shown as zero.
 * "Developers led" comes only from the profile; without it the slot shows
 * merged PRs instead.
 */
function statsOf(stats: Stats): Stat[] {
    const items: (Stat | null)[] = [
        stats.yearsOfEngineering
            ? { value: stats.yearsOfEngineering, label: "Years", detail: "Production Engineering" }
            : null,
        stats.developersLed
            ? { value: stats.developersLed, label: "Developers", detail: "Technical Leadership" }
            : stats.prsMerged
              ? { value: stats.prsMerged, label: "Pull requests", detail: "Merged in Systems" }
              : null,
        stats.products
            ? { value: stats.products, label: "Products", detail: "Owned / Built / Maintained" }
            : null
    ];
    return items.filter((item): item is Stat => item !== null);
}

export function Hero({ profile, stats }: { profile: ProfileData; stats: Stats }) {
    const [first, ...rest] = profile.name.trim().split(/\s+/);
    const items = statsOf(stats);

    return (
        <section aria-labelledby="hero-name" className="py-6 min-[1100px]:px-6 min-[1100px]:py-10">
            <p className="text-ink-2 flex items-center gap-3 font-mono text-xs tracking-[.2em] uppercase">
                <span aria-hidden="true" className="bg-acc h-px w-8" />
                Hey, I&apos;m
            </p>

            <h1
                id="hero-name"
                className="mt-5 font-mono text-[clamp(44px,6vw,76px)] leading-[1.02] font-semibold tracking-tight"
            >
                <span className="block">{first}</span>
                {rest.length > 0 && <span className="text-acc block">{rest.join(" ")}</span>}
            </h1>

            {profile.headline && (
                <p className="mt-6 font-mono text-lg leading-snug sm:text-[23px]">
                    {profile.headline}
                </p>
            )}
            {profile.intro && (
                <p className="text-ink-2 mt-5 max-w-[520px] text-base sm:text-[17px] sm:leading-7">
                    {profile.intro}
                </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/systems" arrow={false} className="tracking-[.08em] uppercase">
                    Explore systems
                    <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
                </Button>
                <Button
                    href="/resume"
                    variant="ghost"
                    className="tracking-[.08em] uppercase"
                >
                    <FileText aria-hidden="true" className="size-4 shrink-0" />
                    View resume
                </Button>
            </div>

            {items.length > 0 && (
                <dl className="border-line divide-line mt-10 flex divide-x border-t pt-6">
                    {items.map((item) => (
                        <div key={item.label} className="min-w-0 flex-1 px-4 first:pl-0 last:pr-0">
                            {/* Value first visually; dt/dd order kept for assistive tech. */}
                            <div className="flex flex-col-reverse">
                                <dt>
                                    <span className="text-ink-2 mt-2 block font-mono text-[11px] tracking-[.16em] uppercase">
                                        {item.label}
                                    </span>
                                    <span className="text-mute mt-1 block text-xs sm:text-sm">
                                        {item.detail}
                                    </span>
                                </dt>
                                <dd className="font-mono text-3xl font-semibold sm:text-4xl">
                                    {item.value}
                                </dd>
                            </div>
                        </div>
                    ))}
                </dl>
            )}
        </section>
    );
}
