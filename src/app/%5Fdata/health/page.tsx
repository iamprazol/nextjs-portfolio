import Link from "next/link";
import { notFound } from "next/navigation";

import { MonoLabel, Panel, RelativeTime } from "@/components/ui";

// Dev-only: when each cache tag was last fetched from GitHub and last marked
// stale. Served at /_data/health; a production build ships a 404 (see
// ../page.tsx for why this is not force-dynamic).

function Time({ iso }: { iso: string | null }) {
    if (!iso) return <span className="text-mute">not yet</span>;
    return (
        <>
            <RelativeTime iso={iso} />
            <span className="text-mute block text-xs">{iso}</span>
        </>
    );
}

export default async function HealthPage() {
    if (process.env.NODE_ENV === "production") notFound();

    // Imported after the production guard, like the data page does.
    const { getHealth } = await import("@/lib/github/observe");
    const health = getHealth();

    return (
        <div className="mx-auto max-w-[1040px] p-4 sm:p-8">
            <MonoLabel as="p">Data layer</MonoLabel>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Cache health</h1>
            <p className="text-ink-2 mt-3 max-w-[70ch] text-sm">
                When each cache tag was last fetched (its loader ran) and last revalidated (a webhook
                or the cron marked it stale). Kept in memory, so it covers this server process since
                it started.{" "}
                <Link href="/_data" className="text-link hover:underline">
                    Data dump
                </Link>
            </p>

            <Panel padding="none" className="mt-8 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                    <thead>
                        <tr className="border-line border-b">
                            {["Tag", "Last fetch", "Last revalidated"].map((heading) => (
                                <th key={heading} scope="col" className="px-5 py-3 font-normal">
                                    <MonoLabel>{heading}</MonoLabel>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-line divide-y font-mono">
                        {health.map((item) => (
                            <tr key={item.tag}>
                                <th scope="row" className="px-5 py-3 font-medium">
                                    {item.tag}
                                </th>
                                <td className="px-5 py-3">
                                    <Time iso={item.fetchedAt} />
                                </td>
                                <td className="px-5 py-3">
                                    <Time iso={item.revalidatedAt} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>
        </div>
    );
}
