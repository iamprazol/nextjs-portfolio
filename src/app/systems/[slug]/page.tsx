import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { StaticUrlState, UrlStateProvider } from "@/components/shell/url-state";
import { ArchitectureExplorer } from "@/components/system/ArchitectureExplorer";
import { OverviewTab } from "@/components/system/OverviewTab";
import { SystemHeader } from "@/components/system/SystemHeader";
import { SystemTabs } from "@/components/system/SystemTabs";
import { MonoLabel, type TabItem } from "@/components/ui";
import { getLog, getSystem, getSystems } from "@/lib/github";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

// Known systems are prerendered. A system tagged later is rendered on its
// first request; an unknown slug reaches notFound() and gets a real 404.
export async function generateStaticParams() {
    return (await getSystems()).map((system) => ({ slug: system.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const system = await getSystem((await params).slug);
    if (!system) return {};

    return {
        title: system.name,
        description: system.proves ?? system.description ?? undefined
    };
}

export default async function SystemPage({ params }: Props) {
    const system = await getSystem((await params).slug);
    if (!system) notFound();

    // getLog() lists pinned entries first; "recent" means newest.
    const log = await getLog({ system: system.slug });
    const recent = [...log].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

    // A tab exists only when GitHub has something to put in it.
    const tabs: TabItem[] = [
        {
            id: "overview",
            label: "Overview",
            panel: <OverviewTab system={system} recent={recent} />
        },
        ...(system.architecture
            ? [
                  {
                      id: "architecture",
                      label: "Architecture",
                      panel: (
                          <ArchitectureExplorer
                              diagram={system.architecture}
                              systemSlug={system.slug}
                              systemName={system.name}
                              problems={system.problems}
                          />
                      )
                  }
              ]
            : []),
        ...(system.problems.length > 0
            ? [{ id: "problems", label: "Engineering Problems", panel: <MonoLabel>Problems</MonoLabel> }]
            : []),
        ...(system.releases.length > 0
            ? [{ id: "releases", label: "Releases", panel: <MonoLabel>Releases</MonoLabel> }]
            : []),
        ...(system.workflow
            ? [{ id: "workflow", label: "Workflow", panel: <MonoLabel>Workflow</MonoLabel> }]
            : [])
    ];

    const content = <SystemTabs tabs={tabs} label={`${system.name} sections`} />;

    return (
        <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <SystemHeader system={system} />
            <div className="mt-10">
                {/* See url-state.tsx: the fallback is the same content without the query string. */}
                <Suspense fallback={<StaticUrlState>{content}</StaticUrlState>}>
                    <UrlStateProvider>{content}</UrlStateProvider>
                </Suspense>
            </div>
        </div>
    );
}
