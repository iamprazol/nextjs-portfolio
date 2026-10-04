import Link from "next/link";

import { ThemeToggle } from "@/components/ui";
import { getProfile } from "@/lib/github";

import { CommandButton } from "./CommandButton";
import { MobileNav, NavLinks } from "./NavLinks";

export async function NavBar() {
    const { name } = await getProfile();
    const [first, ...rest] = name.trim().split(/\s+/);

    return (
        <header className="border-line bg-bg sticky top-0 z-40 border-b">
            <nav
                aria-label="Main"
                className="relative mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
            >
                {/*
                  The ">_" mark is drawn with a pseudo-element so the link's
                  accessible name is exactly its visible text plus "home".
                */}
                <Link
                    href="/"
                    data-mark=">_"
                    className="before:text-acc flex min-h-11 min-w-0 items-center gap-2 font-mono text-sm font-medium tracking-[.16em] uppercase before:content-[attr(data-mark)]"
                >
                    <span className="truncate">
                        {first}
                        {rest.length > 0 && <span className="text-mute"> {rest.join(" ")}</span>}
                        <span className="sr-only"> — home</span>
                    </span>
                </Link>

                {/* Centered on the bar, independent of the side widths. */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2">
                    <NavLinks />
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <ThemeToggle />
                    {/* Below 768px the palette opens from the menu panel instead. */}
                    <div className="hidden md:block">
                        <CommandButton />
                    </div>
                    <MobileNav />
                </div>
            </nav>
        </header>
    );
}
