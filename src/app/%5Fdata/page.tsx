import { notFound } from "next/navigation";

import { MonoLabel, Panel } from "@/components/ui";

// Dev-only dump of every data-layer function, for checking what GitHub
// returns. Served at /_data (the folder is %5Fdata because a literal "_"
// prefix makes it private).

// Not force-dynamic on purpose: a production build prerenders this page, hits
// notFound() below and ships a 404 without ever loading the data layer.

async function settle(load: () => Promise<unknown>) {
    try {
        return { ok: true as const, value: await load() };
    } catch (error) {
        return { ok: false as const, value: error instanceof Error ? error.message : String(error) };
    }
}

function count(value: unknown) {
    if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? "" : "s"}`;
    return value === null ? "null" : "object";
}

export default async function DataPage() {
    if (process.env.NODE_ENV === "production") notFound();

    // Imported here, after the production guard, so a production build never
    // evaluates the data layer on behalf of this page.
    const github = await import("@/lib/github");
    const { env } = await import("@/env");

    const systems = await settle(github.getSystems);
    const first = systems.ok ? (systems.value as { slug: string }[])[0]?.slug : undefined;
    const detail = first ? await settle(() => github.getSystem(first)) : undefined;
    const problem =
        first && detail?.ok
            ? (detail.value as { problems: { slug: string }[] } | null)?.problems[0]?.slug
            : undefined;

    const sections: [string, Awaited<ReturnType<typeof settle>>][] = [
        ["getProfile()", await settle(github.getProfile)],
        ["getStats()", await settle(github.getStats)],
        ["getSystems()", systems],
        ...(first && detail ? [[`getSystem("${first}")`, detail] as [string, typeof detail]] : []),
        ...(first && problem
            ? [
                  [
                      `getProblem("${first}", "${problem}")`,
                      await settle(() => github.getProblem(first, problem))
                  ] as [string, Awaited<ReturnType<typeof settle>>]
              ]
            : []),
        ["getExperiments()", await settle(github.getExperiments)],
        ["getLog({ limit: 10 })", await settle(() => github.getLog({ limit: 10 }))],
        ["getTimeline()", await settle(github.getTimeline)],
        ["getNow()", await settle(github.getNow)],
        ["getActivity()", await settle(github.getActivity)],
        ["getToolUsage()", await settle(github.getToolUsage)]
    ];

    return (
        <div className="mx-auto max-w-[1040px] p-4 sm:p-8">
            <MonoLabel as="p">Data layer</MonoLabel>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">src/lib/github</h1>
            <p className="text-ink-2 mt-3 text-sm">
                Source:{" "}
                <span className="font-mono">
                    {env.GITHUB_MOCK
                        ? `fixtures in ${env.GITHUB_FIXTURES_DIR} (GITHUB_MOCK=1)`
                        : `live GitHub as ${env.GITHUB_LOGIN}`}
                </span>
                . Results are cached on disk for an hour; delete .next/cache to refetch
                sooner.
            </p>

            <div className="mt-8 space-y-3">
                {sections.map(([name, result]) => (
                    <Panel key={name} as="details" padding="none">
                        <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 px-5 font-mono text-sm">
                            <span>{name}</span>
                            <span className={result.ok ? "text-mute" : "text-link"}>
                                {result.ok ? count(result.value) : "error"}
                            </span>
                        </summary>
                        <pre className="border-line text-ink-2 overflow-x-auto border-t p-5 font-mono text-xs leading-5">
                            {result.ok ? JSON.stringify(result.value, null, 2) : result.value}
                        </pre>
                    </Panel>
                ))}
            </div>
        </div>
    );
}
