"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type CommandPaletteContext = {
    open: boolean;
    setOpen: (open: boolean) => void;
    toggle: () => void;
};

const Context = createContext<CommandPaletteContext | null>(null);

/** Holds the palette's open state and the ⌘K / Ctrl+K shortcut. */
export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const toggle = useCallback(() => setOpen((current) => !current), []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                toggle();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [toggle]);

    const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);
    return <Context.Provider value={value}>{children}</Context.Provider>;
}

/** Open the command palette from anywhere, e.g. a "Type a command…" trigger. */
export function useCommandPalette() {
    const context = useContext(Context);
    if (!context) {
        throw new Error("useCommandPalette must be used inside CommandPaletteProvider");
    }
    return context;
}
