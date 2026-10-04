"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { useCommandPalette } from "./command-palette-context";
import { navItems } from "./nav-items";

const isActive = (pathname: string, href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

/** Desktop links, centered in the bar. Hidden below 768px. */
export function NavLinks() {
    const pathname = usePathname();

    return (
        <ul className="hidden items-stretch gap-1 md:flex">
            {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                    <li key={item.href} className="flex">
                        <Link
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                                // The underline sits on the bar's bottom edge.
                                "flex h-16 items-center border-b-2 px-3 font-mono text-sm transition-colors focus-visible:-outline-offset-2",
                                active
                                    ? "border-acc text-ink"
                                    : "text-ink-2 hover:text-ink border-transparent"
                            )}
                        >
                            {item.label}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}

/** Menu button and disclosure panel for the same links. Shown below 768px. */
export function MobileNav() {
    const pathname = usePathname();
    const { setOpen: setPaletteOpen } = useCommandPalette();
    const [open, setOpen] = useState(false);
    const panelId = useId();
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Following a link closes the menu.
    useEffect(() => setOpen(false), [pathname]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
                buttonRef.current?.focus();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open]);

    return (
        <div className="md:hidden">
            <button
                ref={buttonRef}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((current) => !current)}
                className="border-line-2 text-ink-2 hover:border-acc-line hover:text-ink inline-flex size-11 cursor-pointer items-center justify-center rounded-lg border transition-colors"
            >
                {open ? (
                    <X aria-hidden="true" className="size-5" />
                ) : (
                    <Menu aria-hidden="true" className="size-5" />
                )}
            </button>

            <div
                id={panelId}
                hidden={!open}
                className="border-line bg-bg absolute inset-x-0 top-full border-b px-4 pt-2 pb-4"
            >
                <ul>
                    {navItems.map((item) => {
                        const active = isActive(pathname, item.href);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "flex min-h-11 items-center border-l-2 px-3 font-mono text-sm",
                                        active
                                            ? "border-acc text-ink"
                                            : "text-ink-2 border-transparent"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
                <button
                    type="button"
                    onClick={() => {
                        setOpen(false);
                        setPaletteOpen(true);
                    }}
                    className="border-line-2 text-mute mt-3 flex min-h-11 w-full cursor-pointer items-center rounded-lg border px-3 font-mono text-sm"
                >
                    Type a command…
                </button>
            </div>
        </div>
    );
}
