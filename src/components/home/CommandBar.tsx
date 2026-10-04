"use client";

import { useCommandPalette } from "@/components/shell/CommandPalette";

/** A full-width "Type a command…" trigger for the palette. */
export function CommandBar() {
    const { setOpen } = useCommandPalette();

    return (
        <button
            type="button"
            onClick={() => setOpen(true)}
            aria-keyshortcuts="Meta+K Control+K"
            className="border-line-2 bg-panel text-mute hover:border-acc-line shadow-card flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl border px-4 font-mono text-sm transition-colors"
        >
            <span aria-hidden="true" className="text-acc">
                ›
            </span>
            <span className="flex-1 text-left">Type a command…</span>
            <span aria-hidden="true" className="text-ink-2 text-xs">
                ⌘ K
            </span>
        </button>
    );
}
