import { LogEntryList } from "@/components/log/LogEntryList";
import { MonoLabel, Panel, Tag } from "@/components/ui";
import { DiagramTree } from "@/components/ui/diagram";
import { formatDate } from "@/lib/format";
import type { LogEntry, SystemDetail } from "@/lib/github";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="border-line border-t py-4 first:border-t-0 first:pt-0 last:pb-0">
            <dt>
                <MonoLabel>{label}</MonoLabel>
            </dt>
            <dd className="mt-2 text-sm">{children}</dd>
        </div>
    );
}

type OverviewTabProps = {
    system: SystemDetail;
    /** The system's newest log entries. */
    recent: LogEntry[];
};

export function OverviewTab({ system, recent }: OverviewTabProps) {
    const { architecture, latestRelease } = system;

    return (
        <div className="space-y-10">
            <div
                className={
                    architecture
                        ? "grid items-start gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]"
                        : "max-w-xl"
                }
            >
                <Panel as="section" aria-labelledby="system-profile">
                    <MonoLabel as="h2" id="system-profile">
                        System profile
                    </MonoLabel>
                    {/* Every row is optional: a row GitHub has nothing for is left out. */}
                    <dl className="mt-5">
                        {system.role.length > 0 && <Row label="Role">{system.role.join(" · ")}</Row>}
                        {system.stack.length > 0 && (
                            <Row label="Stack">
                                <span className="flex flex-wrap gap-1.5">
                                    {system.stack.map((item) => (
                                        <Tag key={item}>{item}</Tag>
                                    ))}
                                </span>
                            </Row>
                        )}
                        {architecture && architecture.nodes.length > 0 && (
                            <Row label="Systems">
                                {architecture.nodes.map((node) => node.label).join(" · ")}
                            </Row>
                        )}
                        {/* The repo's creation year: the first commit is not in the data GitHub returns here. */}
                        <Row label="Created">{new Date(system.createdAt).getUTCFullYear()}</Row>
                        {latestRelease && (
                            <Row label="Last release">
                                <span className="font-mono">{latestRelease.tag}</span>
                                <span className="text-mute">
                                    {" · "}
                                    <time dateTime={latestRelease.publishedAt}>
                                        {formatDate(latestRelease.publishedAt)}
                                    </time>
                                </span>
                            </Row>
                        )}
                    </dl>
                </Panel>

                {architecture && (
                    <Panel as="section" aria-labelledby="architecture-preview" className="min-w-0">
                        <MonoLabel as="h2" id="architecture-preview">
                            Architecture
                        </MonoLabel>
                        <DiagramTree
                            diagram={architecture}
                            label={`Architecture of ${system.name}`}
                            className="mt-5"
                        />
                    </Panel>
                )}
            </div>

            {recent.length > 0 && (
                <section aria-labelledby="recent-work">
                    <MonoLabel as="h2" id="recent-work">
                        Recent work
                    </MonoLabel>
                    <div className="mt-4">
                        <LogEntryList entries={recent} showSystem={false} />
                    </div>
                </section>
            )}
        </div>
    );
}
