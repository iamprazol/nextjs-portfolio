import { Tag } from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { ReleaseNotes } from "@/lib/github";

const cell = "border-line border-t px-4 py-4 align-top";
const head = "text-mute px-4 pb-3 text-left font-mono text-[11px] font-normal tracking-[.16em] uppercase";

/** Releases, newest first, each with the PRs merged since the release before it. */
export function ReleasesTab({ notes }: { notes: ReleaseNotes[] }) {
    return (
        // The table scrolls inside its own box on narrow screens.
        <div
            role="region"
            aria-label="Releases"
            tabIndex={0}
            className="border-line-2 bg-panel shadow-card overflow-x-auto rounded-xl border pt-4"
        >
            <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                    <tr>
                        <th scope="col" className={head}>
                            Version
                        </th>
                        <th scope="col" className={head}>
                            Date
                        </th>
                        <th scope="col" className={head}>
                            Release
                        </th>
                        <th scope="col" className={head}>
                            Changes
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {notes.map(({ release, changes }) => (
                        <tr key={release.tag}>
                            <th scope="row" className={`${cell} text-left font-normal whitespace-nowrap`}>
                                {release.url ? (
                                    <a
                                        href={release.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-link font-mono hover:underline"
                                    >
                                        {release.tag}
                                    </a>
                                ) : (
                                    <span className="font-mono">{release.tag}</span>
                                )}
                                {release.isPrerelease && <Tag className="ml-2">pre-release</Tag>}
                            </th>
                            <td className={`${cell} text-ink-2 whitespace-nowrap`}>
                                <time dateTime={release.publishedAt}>
                                    {formatDate(release.publishedAt)}
                                </time>
                            </td>
                            <td className={cell}>
                                {release.name ?? <span className="text-mute">—</span>}
                            </td>
                            <td className={cell}>
                                {changes.length > 0 ? (
                                    <ul className="space-y-1.5">
                                        {changes.map((change) => (
                                            <li key={change.id}>
                                                {change.url ? (
                                                    <a
                                                        href={change.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="hover:text-link hover:underline"
                                                    >
                                                        {change.title}
                                                    </a>
                                                ) : (
                                                    change.title
                                                )}
                                                {change.pr && (
                                                    <span className="text-mute font-mono text-xs">
                                                        {" "}
                                                        #{change.pr.number}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className="text-mute">—</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
