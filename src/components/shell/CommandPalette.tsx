"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { useCommandPalette } from "./command-palette-context";

export { useCommandPalette } from "./command-palette-context";

export type CommandPaletteProps = {
    systems: { slug: string; name: string; description: string | null }[];
    /** Slug of the first system that has an architecture diagram, if any. */
    architectureSlug: string | null;
    /** Slug of the first system that has case studies, if any. */
    problemsSlug: string | null;
    githubUrl: string;
    email: string | null;
};

type Item = {
    /** The command as typed, e.g. "projects". */
    name: string;
    description: string;
    run: () => void;
    /** Leave the palette open after running (the item shows its own feedback). */
    keepOpen?: boolean;
};

/**
 * cmdk's default fuzzy match is loose enough that "relay" also matches
 * "projects". Match on substrings instead: the command name first, then its
 * description.
 */
function filter(value: string, search: string, keywords?: string[]) {
    const query = search.trim().toLowerCase();
    // value is "<group> <name>"; the group prefix only keeps values unique.
    const name = value.slice(value.indexOf(" ") + 1).toLowerCase();

    if (name.startsWith(query)) return 1;
    if (name.includes(query)) return 0.8;
    return keywords?.some((keyword) => keyword.toLowerCase().includes(query)) ? 0.5 : 0;
}

const groupClass =
    "[&_[cmdk-group-heading]]:text-mute [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:tracking-[.16em] [&_[cmdk-group-heading]]:uppercase";

export function CommandPalette({
    systems,
    architectureSlug,
    problemsSlug,
    githubUrl,
    email
}: CommandPaletteProps) {
    const { open, setOpen } = useCommandPalette();
    const router = useRouter();
    const { resolvedTheme, setTheme } = useTheme();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const timer = setTimeout(() => {
            setCopied(false);
            setOpen(false);
        }, 900);
        return () => clearTimeout(timer);
    }, [copied, setOpen]);

    const go = (href: string) => () => router.push(href);

    const navigate: Item[] = [
        { name: "projects", description: "All systems", run: go("/systems") },
        ...(architectureSlug
            ? [
                  {
                      name: "architecture",
                      description: "How a system fits together",
                      run: go(`/systems/${architectureSlug}?tab=architecture`)
                  }
              ]
            : []),
        ...(problemsSlug
            ? [
                  {
                      name: "problems",
                      description: "Engineering case studies",
                      run: go(`/systems/${problemsSlug}?tab=problems`)
                  }
              ]
            : []),
        { name: "timeline", description: "Year by year", run: go("/timeline") },
        { name: "experiments", description: "The lab", run: go("/lab") },
        { name: "log", description: "Engineering log", run: go("/log") },
        { name: "about", description: "How I work", run: go("/about") },
        { name: "resume", description: "Printable résumé", run: go("/resume") }
    ];

    const actions: Item[] = [
        {
            name: "theme",
            description: `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`,
            run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark")
        },
        {
            name: "github",
            description: "Open GitHub profile",
            run: () => window.open(githubUrl, "_blank", "noopener,noreferrer")
        },
        { name: "contact", description: "Send a message", run: go("/about#contact") },
        ...(email
            ? [
                  {
                      name: "copy email",
                      description: copied ? "Copied" : email,
                      keepOpen: true,
                      run: () => {
                          navigator.clipboard.writeText(email).then(
                              () => setCopied(true),
                              () => setOpen(false)
                          );
                      }
                  }
              ]
            : [])
    ];

    const renderItem = (item: Item, prefix: string) => (
        <Command.Item
            key={`${prefix}:${item.name}`}
            value={`${prefix} ${item.name}`}
            keywords={[item.description]}
            onSelect={() => {
                item.run();
                if (!item.keepOpen) setOpen(false);
            }}
            className="data-[selected=true]:bg-acc-soft flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2"
        >
            <span className="text-ink shrink-0 font-mono text-sm">
                <span aria-hidden="true" className="text-acc">
                    ▸{" "}
                </span>
                {item.name}
            </span>
            <span className="text-mute min-w-0 truncate text-sm">{item.description}</span>
        </Command.Item>
    );

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Command palette"
            filter={filter}
            overlayClassName="bg-term/60 fixed inset-0 z-50"
            contentClassName="border-line-2 bg-panel shadow-card fixed top-[12vh] left-1/2 z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border"
        >
            <Command.Input
                placeholder="Type a command…"
                className="border-line text-ink placeholder:text-mute h-12 w-full border-b bg-transparent px-4 font-mono text-sm outline-none"
            />
            <Command.List className="max-h-[min(60vh,26rem)] overflow-y-auto p-2">
                <Command.Empty className="text-mute px-3 py-6 font-mono text-sm">
                    No matching command.
                </Command.Empty>

                <Command.Group heading="Navigate" className={groupClass}>
                    {navigate.map((item) => renderItem(item, "go"))}
                </Command.Group>

                {systems.length > 0 && (
                    <Command.Group heading="Systems" className={groupClass}>
                        {systems.map((system) =>
                            renderItem(
                                {
                                    name: system.name.toLowerCase(),
                                    description: system.description ?? "System",
                                    run: go(`/systems/${system.slug}`)
                                },
                                "system"
                            )
                        )}
                    </Command.Group>
                )}

                <Command.Group heading="Actions" className={groupClass}>
                    {actions.map((item) => renderItem(item, "action"))}
                </Command.Group>
            </Command.List>
            <p aria-live="polite" className="sr-only">
                {copied ? "Email address copied" : ""}
            </p>
        </Command.Dialog>
    );
}
