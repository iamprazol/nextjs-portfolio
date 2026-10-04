import { Boxes } from "lucide-react";
import { notFound } from "next/navigation";

import {
    Button,
    IconTile,
    MonoLabel,
    Panel,
    RingGauge,
    SectionHeader,
    StatusBadge,
    StatusDot,
    Tabs,
    Tag,
    ThemeToggle,
    type SystemStatus
} from "@/components/ui";

// Dev-only gallery of every primitive, in both themes. Served at /_ui (the
// folder is %5Fui because a literal "_" prefix makes it private). All content
// here is placeholder copy, not work data.

const statuses: SystemStatus[] = [
    "production",
    "building",
    "active",
    "experiment",
    "maintenance"
];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mt-10 first:mt-6">
            <MonoLabel as="h3">{title}</MonoLabel>
            <div className="mt-3 flex flex-wrap items-center gap-3">{children}</div>
        </div>
    );
}

function Gallery({ theme }: { theme: "light" | "dark" }) {
    return (
        <section className={`${theme} bg-bg text-ink min-w-0 flex-1 p-6 sm:p-8`}>
            <MonoLabel as="h2">{theme}</MonoLabel>

            <Block title="SectionHeader">
                <SectionHeader
                    className="w-full"
                    eyebrow="01 — Section"
                    title="Section title"
                    link={{ href: "/_ui", label: "View all" }}
                />
            </Block>

            <Block title="Button">
                <Button>Primary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="solid">Solid accent</Button>
                <Button href="/_ui">Link button</Button>
                <Button disabled>Disabled</Button>
            </Block>

            <Block title="StatusBadge">
                {statuses.map((status) => (
                    <StatusBadge key={status} status={status} />
                ))}
            </Block>

            <Block title="StatusDot">
                {statuses.map((status) => (
                    <StatusDot key={status} status={status} />
                ))}
            </Block>

            <Block title="Tag">
                <Tag>TypeScript</Tag>
                <Tag>PHP</Tag>
                <Tag>rest-api</Tag>
            </Block>

            <Block title="IconTile">
                <IconTile monogram="AB" />
                <IconTile icon={Boxes} />
            </Block>

            <Block title="MonoLabel">
                <MonoLabel>Mono label</MonoLabel>
            </Block>

            <Block title="Panel">
                <Panel className="w-full">
                    <div className="flex items-center gap-3">
                        <IconTile monogram="AB" />
                        <div>
                            <p className="text-[22px] leading-tight font-semibold">
                                Card title
                            </p>
                            <p className="text-ink-2 text-sm">
                                Secondary text on a panel.
                            </p>
                        </div>
                    </div>
                    <Panel inset className="mt-4">
                        <p className="text-ink-2 text-sm">Inset panel.</p>
                    </Panel>
                </Panel>
            </Block>

            <Block title="Tabs">
                <Tabs
                    className="w-full"
                    label="Example tabs"
                    tabs={[
                        { id: "one", label: "Overview", panel: <p>First panel.</p> },
                        { id: "two", label: "Architecture", panel: <p>Second panel.</p> },
                        { id: "three", label: "Problems", panel: <p>Third panel.</p> },
                        { id: "four", label: "Releases", panel: <p>Fourth panel.</p> }
                    ]}
                />
            </Block>

            <Block title="RingGauge">
                <RingGauge value={0.72} label="Example" readout="72%" />
                <RingGauge value={0.25} label="Small" readout="25%" size={72} />
                <RingGauge value={1} label="Full" readout="100%" />
            </Block>
        </section>
    );
}

export default function UiPage() {
    if (process.env.NODE_ENV === "production") notFound();

    return (
        <main className="min-h-screen">
            <div className="flex items-center justify-between gap-4 p-6 sm:px-8">
                <p className="text-ink-2 text-sm">
                    Every primitive, in both themes side by side.
                </p>
                <ThemeToggle />
            </div>
            <div className="flex flex-col lg:flex-row">
                <Gallery theme="light" />
                <Gallery theme="dark" />
            </div>
        </main>
    );
}
