import type { LogEntry } from "@/lib/github";

import { LogEntryDisclosure } from "./LogEntryDisclosure";

/** The log page's list. Each entry opens to show its description and links. */
export function LogList({ entries }: { entries: LogEntry[] }) {
    return (
        <ol className="border-line-2 bg-panel shadow-card divide-line divide-y rounded-xl border">
            {entries.map((entry) => (
                <LogEntryDisclosure key={entry.id} entry={entry} />
            ))}
        </ol>
    );
}
