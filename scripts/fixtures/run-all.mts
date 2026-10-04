import { gql } from "../../src/lib/github/client";
import { getConfig } from "../../src/lib/github/config";
import { REPO_FILE } from "../../src/lib/github/queries";
import {
    LAB_TOPIC,
    SYSTEM_TOPIC,
    fetchCommitCounts,
    fetchEvents,
    fetchMergedPrs,
    fetchRecentContributions,
    fetchStars,
    fetchTopicRepos,
    fetchUser,
    fetchYearlyContributions
} from "../../src/lib/github/sources";

/**
 * Every request the data layer makes, so the recorder can capture each one.
 * Step 2.6 replaces this with calls to the public get* functions.
 */
export async function runAll() {
    const { contentRepo } = getConfig();

    const [user, systems, labs] = await Promise.all([
        fetchUser(),
        fetchTopicRepos(SYSTEM_TOPIC),
        fetchTopicRepos(LAB_TOPIC)
    ]);
    const repos = [...systems, ...labs].map((repo) => repo.nameWithOwner);

    const [prs, years, recent, stars, events, commits, profile] = await Promise.all([
        fetchMergedPrs(repos),
        fetchYearlyContributions(),
        fetchRecentContributions(),
        fetchStars(),
        fetchEvents(),
        fetchCommitCounts(repos),
        gql(REPO_FILE, { ...contentRepo, e0: "HEAD:portfolio/profile.json" })
    ]);

    console.log({
        user: user.login,
        systems: systems.length,
        labs: labs.length,
        mergedPrs: prs.total,
        years: years.map((y) => `${y.year}:${y.contributions.contributionCalendar.totalContributions}`).join(" "),
        recentCommits: recent.recent.totalCommitContributions,
        baselineCommits: recent.baseline.totalCommitContributions,
        stars: stars.length,
        events: events.length,
        commitCounts: commits.length,
        hasProfileFile: Boolean((profile as { repository: { f0: unknown } | null }).repository?.f0)
    });
}
