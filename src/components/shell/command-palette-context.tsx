"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

type CommandPaletteContext = {
    open: boolean;
    setOpen: (open: boolean) => void;
    toggle: () => void;
};

const Context = createContext<CommandPaletteContext | null>(null);

/** Holds the palette's open state and the ⌘K / Ctrl+K shortcut. */
export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpenState] = useState(false);
    const openRef = useRef(false);
    const returnFocusTo = useRef<HTMLElement | null>(null);

    // Remember what had focus when the palette opened and give it back on
    // close, whether it was opened by a button or by the shortcut.
    const setOpen = useCallback((next: boolean) => {
        if (next === openRef.current) return;
        openRef.current = next;

        if (next) {
            returnFocusTo.current =
                document.activeElement instanceof HTMLElement ? document.activeElement : null;
        } else {
            const target = returnFocusTo.current;
            // After the dialog has unmounted and released its focus trap.
            requestAnimationFrame(() => {
                if (target?.isConnected) target.focus();
            });
        }
        setOpenState(next);
    }, []);
    const toggle = useCallback(() => setOpen(!openRef.current), [setOpen]);

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

    const value = useMemo(() => ({ open, setOpen, toggle }), [open, setOpen, toggle]);
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
