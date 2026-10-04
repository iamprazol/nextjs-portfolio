import { SystemCard } from "@/components/systems/SystemCard";
import { SectionHeader } from "@/components/ui";
import type { System } from "@/lib/github";

type SystemsSectionProps = { eyebrow: string; systems: System[] };

/** The first four systems, in featured order. */
export function SystemsSection({ eyebrow, systems }: SystemsSectionProps) {
    return (
        <section>
            <SectionHeader
                eyebrow={eyebrow}
                title="Real products. Real users. Real problems."
                link={{ href: "/systems", label: "ALL SYSTEMS" }}
            />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {systems.slice(0, 4).map((system, index) => (
                    <li key={system.slug}>
                        <SystemCard system={system} index={index} />
                    </li>
                ))}
            </ul>
        </section>
    );
}
