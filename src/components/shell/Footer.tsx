import { getProfile } from "@/lib/github";

export async function Footer() {
    const { name, links } = await getProfile();

    // Only the links the profile actually has.
    const items = [
        { label: "GitHub", href: links.github },
        { label: "LinkedIn", href: links.linkedin },
        { label: "X", href: links.x },
        { label: "Website", href: links.website },
        { label: "Email", href: links.email && `mailto:${links.email}` }
    ].filter((item): item is { label: string; href: string } => Boolean(item.href));

    return (
        <footer className="border-line border-t">
            <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                <div>
                    <span aria-hidden="true" className="bg-acc block h-0.5 w-8" />
                    <p className="text-ink-2 mt-3 font-mono text-[11px] tracking-[.2em] uppercase">
                        Build / Automate / Improve
                    </p>
                </div>

                <ul className="-mx-2 flex flex-wrap items-center gap-x-1">
                    {items.map((item) => (
                        <li key={item.label}>
                            <a
                                href={item.href}
                                {...(item.href.startsWith("http")
                                    ? { target: "_blank", rel: "noreferrer" }
                                    : {})}
                                className="text-ink-2 hover:text-ink flex min-h-11 items-center px-2 font-mono text-sm transition-colors"
                            >
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>

                <p className="text-mute font-mono text-xs">
                    © {new Date().getFullYear()} {name}
                </p>
            </div>
        </footer>
    );
}
