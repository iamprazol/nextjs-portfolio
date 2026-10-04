import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

const variants = {
    /** Accent outline + soft fill + arrow. The default call to action. */
    primary:
        "border-acc-line bg-acc-soft text-acc-ink hover:border-acc border",
    ghost: "border-line-2 text-ink hover:border-acc-line border",
    /** Solid accent, for the light-theme hero CTA. */
    solid: "border-acc bg-acc text-on-acc border hover:opacity-90"
};

type Variant = keyof typeof variants;

type Common = {
    variant?: Variant;
    /** Trailing arrow. On by default for `primary`. */
    arrow?: boolean;
};

type ButtonAsButton = Common &
    ComponentPropsWithoutRef<"button"> & { href?: undefined };
type ButtonAsLink = Common &
    Omit<ComponentPropsWithoutRef<"a">, "href"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
    const { variant = "primary", arrow, className, children, ...rest } = props;
    const showArrow = arrow ?? variant === "primary";

    const classes = cn(
        // min-h-11 = 44px touch target
        "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 font-mono text-sm transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
    );

    const content = (
        <>
            {children}
            {showArrow && (
                <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
            )}
        </>
    );

    if (rest.href !== undefined) {
        const { href, ...anchorProps } = rest;
        const external = /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");

        return external ? (
            <a href={href} className={classes} {...anchorProps}>
                {content}
            </a>
        ) : (
            <Link href={href} className={classes} {...anchorProps}>
                {content}
            </Link>
        );
    }

    return (
        <button type="button" className={classes} {...rest}>
            {content}
        </button>
    );
}
