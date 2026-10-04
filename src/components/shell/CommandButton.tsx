"use client";

import { cn } from "@/lib/cn";

import { useCommandPalette } from "./command-palette-context";

export function CommandButton({ className }: { className?: string }) {
    const { setOpen } = useCommandPalette();

    return (
        <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open command palette"
            aria-keyshortcuts="Meta+K Control+K"
            className={cn(
                "border-line-2 text-ink-2 hover:border-acc-line hover:text-ink inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-lg border px-3 font-mono text-xs transition-colors",
                className
            )}
        >
            <kbd className="font-mono">⌘</kbd>
            <kbd className="font-mono">K</kbd>
        </button>
    );
}
