import { GraduationCap } from "lucide-react";
import { useId } from "react";

import { IconTile, Panel, Tag } from "@/components/ui";

/** Languages that are new to the owner's recent commits. */
export function LearningCard({ languages }: { languages: string[] }) {
    const headingId = useId();

    return (
        <Panel as="section" aria-labelledby={headingId} className="h-full">
            <div className="flex items-center gap-3">
                <IconTile icon={GraduationCap} />
                <h2 id={headingId} className="font-mono text-lg font-medium">
                    Learning now
                </h2>
            </div>
            <ul className="mt-5 flex flex-wrap gap-2">
                {languages.map((language) => (
                    <li key={language}>
                        <Tag>{language}</Tag>
                    </li>
                ))}
            </ul>
            <p className="text-ink-2 mt-4 text-sm">
                Languages that showed up in the last 90 days of commits and were rare before.
            </p>
        </Panel>
    );
}
