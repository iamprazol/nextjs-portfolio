import { CommandBar } from "@/components/home/CommandBar";
import { Hero } from "@/components/home/Hero";
import { LocationGlobe } from "@/components/home/LocationGlobe";
import { LogSection } from "@/components/home/LogSection";
import { NowCard } from "@/components/home/NowCard";
import { LocalTimeCard } from "@/components/home/LocalTimeCard";
import { SessionCard } from "@/components/home/SessionCard";
import { SystemStatusCard } from "@/components/home/SystemStatusCard";
import { SystemsSection } from "@/components/home/SystemsSection";
import {
    getActivity,
    getExperiments,
    getLog,
    getNow,
    getProfile,
    getStats,
    getSystems
} from "@/lib/github";

// Regenerated at most once an hour; webhooks refresh it sooner (M13).
export const revalidate = 3600;

const rail =
    "flex min-w-0 flex-[1_1_100%] flex-col gap-4 min-[1100px]:max-w-[320px]";

export default async function Home() {
    const [profile, systems, experiments, now, stats, fullLog, activity] = await Promise.all([
        getProfile(),
        getSystems(),
        getExperiments(),
        getNow(),
        getStats(),
        getLog(),
        getActivity()
    ]);

    // getLog() lists pinned entries first; the home preview wants the newest.
    const log = [...fullLog].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

    // Sections are numbered in the order they actually appear.
    const showSystems = systems.length > 0;
    const showLog = log.length > 0 || activity.length > 0;
    const eyebrow = (position: number, name: string) =>
        `${String(position).padStart(2, "0")} — ${name}`;

    return (
        <div className="bg-grid">
            <div className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-8">
                {/*
                  The hero comes first in the markup, as the main content.
                  From 1100px the row reads left rail · hero · right rail
                  (the left rail is moved ahead with order). Below that the
                  hero takes the first row and the rails share the next;
                  below 768px everything stacks.
                */}
                <div className="flex flex-wrap items-start gap-6 py-8 lg:py-12">
                    <div className="min-w-0 flex-[999_1_100%] min-[1100px]:flex-[999_1_420px]">
                        <Hero profile={profile} stats={stats} />
                    </div>
                    <aside aria-label="Status" className={`${rail} md:flex-[1_1_260px] min-[1100px]:-order-1`}>
                        {profile.location?.timezone && (
                            <LocalTimeCard
                                city={profile.location.label.split(",")[0]}
                                timeZone={profile.location.timezone}
                            />
                        )}
                        {systems.length > 0 && <SystemStatusCard systems={systems} />}
                        <SessionCard />
                    </aside>
                    <aside aria-label="Now" className={`${rail} md:flex-[1_1_280px]`}>
                        <NowCard now={now} systems={systems} experiments={experiments} />
                        {profile.location?.lat != null && profile.location.lng != null && (
                            <LocationGlobe
                                label={profile.location.label}
                                lat={profile.location.lat}
                                lng={profile.location.lng}
                            />
                        )}
                        <CommandBar />
                    </aside>
                </div>

                <div className="space-y-20 pt-10">
                    {showSystems && (
                        <SystemsSection eyebrow={eyebrow(1, "SYSTEMS")} systems={systems} />
                    )}
                    {showLog && (
                        <LogSection
                            eyebrow={eyebrow(showSystems ? 2 : 1, "ENGINEERING LOG")}
                            log={log}
                            activity={activity}
                            githubUrl={profile.links.github}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
