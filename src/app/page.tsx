import { Hero } from "@/components/home/Hero";
import { NowCard } from "@/components/home/NowCard";
import { LocalTimeCard } from "@/components/home/LocalTimeCard";
import { SessionCard } from "@/components/home/SessionCard";
import { SystemStatusCard } from "@/components/home/SystemStatusCard";
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
    "flex min-w-0 flex-[1_1_100%] flex-col gap-4 min-[1100px]:order-none min-[1100px]:max-w-[320px]";

export default async function Home() {
    // Later steps add the sections that use the rest of these results.
    const [profile, systems, experiments, now, stats] = await Promise.all([
        getProfile(),
        getSystems(),
        getExperiments(),
        getNow(),
        getStats(),
        getLog({ limit: 3 }),
        getActivity()
    ]);

    return (
        <div className="bg-grid">
            <div className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-8">
                {/*
                  From 1100px: left rail · hero · right rail in one row.
                  Below that the hero takes the first row and the rails share
                  the next; below 768px everything stacks.
                */}
                <div className="flex flex-wrap items-start gap-6 py-8 lg:py-12">
                    <aside aria-label="Status" className={`${rail} order-2 md:flex-[1_1_260px]`}>
                        {profile.location?.timezone && (
                            <LocalTimeCard
                                city={profile.location.label.split(",")[0]}
                                timeZone={profile.location.timezone}
                            />
                        )}
                        {systems.length > 0 && <SystemStatusCard systems={systems} />}
                        <SessionCard />
                    </aside>
                    <div className="order-1 min-w-0 flex-[999_1_100%] min-[1100px]:order-none min-[1100px]:flex-[999_1_520px]">
                        <Hero profile={profile} stats={stats} />
                    </div>
                    <aside aria-label="Now" className={`${rail} order-3 md:flex-[1_1_280px]`}>
                        <NowCard now={now} systems={systems} experiments={experiments} />
                    </aside>
                </div>
            </div>
        </div>
    );
}
