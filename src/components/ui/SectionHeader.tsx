import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/cn";

import { MonoLabel } from "./MonoLabel";

type SectionHeaderProps = {
    /** Mono eyebrow above the title, e.g. "01 — SYSTEMS". */
    eyebrow?: string;
    title: string;
    /** Optional right-hand link, e.g. "All systems". */
    link?: { href: string; label: string };
    as?: "h1" | "h2" | "h3";
    className?: string;
};

export function SectionHeader({
    eyebrow,
    title,
    link,
    as: Heading = "h2",
    className
}: SectionHeaderProps) {
    return (
        <div
            className={cn(
                "flex flex-wrap items-end justify-between gap-x-6 gap-y-2",
                className
            )}
        >
            <div>
                {eyebrow && <MonoLabel as="p">{eyebrow}</MonoLabel>}
                <Heading className="text-ink mt-2 text-[28px] leading-tight font-semibold tracking-tight sm:text-4xl">
                    {title}
                </Heading>
            </div>
            {link && (
                <Link
                    href={link.href}
                    className="text-link inline-flex min-h-11 items-center gap-1.5 font-mono text-sm hover:underline"
                >
                    {link.label}
                    <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
            )}
        </div>
    );
}
