"use client";

import { ThemeProvider } from "next-themes";

import { CommandPaletteProvider } from "@/components/shell/command-palette-context";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="pp-theme"
        >
            <CommandPaletteProvider>{children}</CommandPaletteProvider>
        </ThemeProvider>
    );
}
