"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const base =
    "inline-flex h-11 w-[5.5rem] items-center justify-center gap-2 rounded-lg border border-line-2 font-mono text-xs";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // The stored theme is unknown on the server, so hold the space until mounted.
    if (!mounted) {
        return <span aria-hidden="true" className={base} />;
    }

    const next = resolvedTheme === "dark" ? "light" : "dark";
    const Icon = next === "light" ? Sun : Moon;

    return (
        <button
            type="button"
            onClick={() => setTheme(next)}
            aria-label={`Switch to ${next} mode`}
            className={`${base} text-ink-2 hover:border-acc-line hover:text-ink cursor-pointer transition-colors`}
        >
            <Icon aria-hidden="true" className="size-4" />
            {next === "light" ? "Light" : "Dark"}
        </button>
    );
}
