import * as data from "../../src/lib/github/data";

/**
 * Calls every public getter (the uncached versions), so the recorder captures
 * each request the site can make — including one detail page per system and
 * problem.
 */
export async function runAll() {
    const [profile, systems, log, timeline, now, activity, experiments, tools, stats] =
        await Promise.all([
            data.getProfile(),
            data.getSystems(),
            data.getFullLog(),
            data.getTimeline(),
            data.getNow(),
            data.getActivity(),
            data.getExperiments(),
            data.getToolUsage(),
            data.getStats()
        ]);

    let problems = 0;
    let evidence = 0;
    for (const { slug } of systems) {
        const system = await data.getSystem(slug);
        await data.getReleaseNotes(slug);
        for (const problem of system?.problems ?? []) {
            if (await data.getProblem(slug, problem.slug)) problems++;
            evidence += (await data.getProblemEvidence(slug, problem.slug)).length;
        }
    }

    return {
        profile: `${profile.name} (from ${profile.source})`,
        systems: systems.map((system) => `${system.slug}:${system.status}`).join(" ") || "none",
        problems,
        evidence,
        experiments: experiments.length,
        logEntries: log.length,
        timelineYears: timeline.map((year) => year.year).join(" ") || "none",
        building: now.building?.slug ?? "nothing",
        learning: now.learning.join(", ") || "nothing",
        exploring: now.exploring.join(", ") || "nothing",
        activity: activity.length,
        tools: tools.length,
        stats
    };
}
